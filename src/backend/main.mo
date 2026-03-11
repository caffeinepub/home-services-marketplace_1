import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  public type UserRole = AccessControl.UserRole;

  public type BrandingConfig = {
    logoDataUrl : ?Text;
    siteName : Text;
    tagline : Text;
    footerText : Text;
    primaryColor : Text;
  };

  public type ServiceCategory = {
    #laptopRepair;
    #desktopRepair;
    #computerSales;
    #accessoriesSales;
    #networkSetup;
    #dataRecovery;
  };

  public type Service = {
    id : Nat;
    name : Text;
    description : Text;
    category : ServiceCategory;
    minPrice : Nat;
    maxPrice : Nat;
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type Booking = {
    id : Nat;
    customer : Principal;
    serviceId : Nat;
    date : Text;
    timeSlot : Text;
    address : Text;
    status : BookingStatus;
    assignedProfessional : ?Principal;
    createdAt : Int;
  };

  public type ProfessionalProfile = {
    displayName : Text;
    category : ServiceCategory;
    latitude : ?Float;
    longitude : ?Float;
  };

  public type UserProfile = {
    role : UserRole;
    professional : ?ProfessionalProfile;
    mobileNumber : ?Text;
  };

  public type PlatformStats = {
    totalUsers : Nat;
    totalProfessionals : Nat;
    totalBookings : Nat;
    totalCompletedBookings : Nat;
    totalRevenue : Nat;
  };

  public type ProfessionalInfo = {
    principal : Principal;
    displayName : Text;
    category : ServiceCategory;
    latitude : ?Float;
    longitude : ?Float;
  };

  public type CustomerInfo = {
    principal : Principal;
    mobileNumber : ?Text;
    bookingCount : Nat;
  };

  public type ChatMessage = {
    id : Nat;
    bookingId : Nat;
    sender : Principal;
    senderRole : Text;
    text : Text;
    timestamp : Int;
  };

  type BookingHistory = {
    customer : Principal;
    count : Nat;
  };

  var brandingConfig = {
    logoDataUrl = null;
    siteName = "Lepzo";
    tagline = "Your Trusted Computer Experts";
    footerText = "Built with love by Hemanth";
    primaryColor = "#6366f1";
  } : BrandingConfig;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let users = Map.empty<Principal, UserProfile>();
  let services = Map.empty<Nat, Service>();
  let bookings = Map.empty<Nat, Booking>();
  let messages = Map.empty<Nat, ChatMessage>();
  let bookingHistory = Map.empty<Principal, BookingHistory>();
  var nextServiceId = 1;
  var nextBookingId = 1;
  var nextMessageId = 1;
  var isInitialized = false;

  func isAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func getTotalProfessionals() : Nat {
    var count = 0;
    for ((_, user) in users.entries()) {
      if (user.professional != null) {
        count += 1;
      };
    };
    count;
  };

  func getTotalCompletedBookings() : Nat {
    var count = 0;
    for ((_, booking) in bookings.entries()) {
      if (booking.status == #completed) {
        count += 1;
      };
    };
    count;
  };

  func getTotalRevenue() : Nat {
    var total = 0;
    for ((_, booking) in bookings.entries()) {
      if (booking.status == #completed) {
        switch (services.get(booking.serviceId)) {
          case (?service) { total += service.maxPrice };
          case (null) {};
        };
      };
    };
    total;
  };

  // Branding Config Management
  public shared ({ caller }) func setBrandingConfig(config : BrandingConfig) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update branding config");
    };
    brandingConfig := config;
  };

  public query func getBrandingConfig() : async BrandingConfig {
    brandingConfig;
  };

  // User Profile Management (Required by Frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public shared ({ caller }) func updateMobileNumber(mobileNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mobile number");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        let updatedProfile = { profile with mobileNumber = ?mobileNumber };
        users.add(caller, updatedProfile);
      };
    };
  };

  // User Registration
  public shared ({ caller }) func registerProfessional(displayName : Text, category : ServiceCategory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as professionals");
    };
    let profile : UserProfile = {
      role = #user;
      professional = ?{
        displayName;
        category;
        latitude = null;
        longitude = null;
      };
      mobileNumber = null;
    };
    users.add(caller, profile);
  };

  public shared ({ caller }) func registerCustomer() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register as customers");
    };
    let profile : UserProfile = {
      role = #user;
      professional = null;
      mobileNumber = null;
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func isAdminCaller() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check admin status");
    };
    isAdmin(caller);
  };

  // Service Management
  public shared ({ caller }) func addService(name : Text, description : Text, category : ServiceCategory, minPrice : Nat, maxPrice : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };
    let service : Service = {
      id = nextServiceId;
      name;
      description;
      category;
      minPrice;
      maxPrice;
    };
    services.add(nextServiceId, service);
    nextServiceId += 1;
    service.id;
  };

  public shared ({ caller }) func updateService(serviceId : Nat, name : Text, description : Text, category : ServiceCategory, minPrice : Nat, maxPrice : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };
    switch (services.get(serviceId)) {
      case (null) { Runtime.trap("Service not found") };
      case (?_) {
        let service : Service = {
          id = serviceId;
          name;
          description;
          category;
          minPrice;
          maxPrice;
        };
        services.add(serviceId, service);
      };
    };
  };

  public shared ({ caller }) func removeService(serviceId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove services");
    };
    switch (services.get(serviceId)) {
      case (null) { Runtime.trap("Service not found") };
      case (?_) {
        services.remove(serviceId);
      };
    };
  };

  public query func listServices() : async [Service] {
    let result = List.empty<Service>();
    for ((_, service) in services.entries()) {
      result.add(service);
    };
    result.toArray();
  };

  public query func getServicesByCategory(category : ?ServiceCategory) : async [Service] {
    let result = List.empty<Service>();
    for ((_, service) in services.entries()) {
      switch (category) {
        case (null) { result.add(service) };
        case (?cat) {
          if (service.category == cat) {
            result.add(service);
          };
        };
      };
    };
    result.toArray();
  };

  // Booking Management (Customer)
  public shared ({ caller }) func createBooking(serviceId : Nat, date : Text, timeSlot : Text, address : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) {
        switch (profile.professional) {
          case (?_) { Runtime.trap("Professionals cannot create bookings as customers") };
          case (null) {
            switch (services.get(serviceId)) {
              case (null) { Runtime.trap("Service not found") };
              case (?_) {
                let booking : Booking = {
                  id = nextBookingId;
                  customer = caller;
                  serviceId;
                  date;
                  timeSlot;
                  address;
                  status = #pending;
                  assignedProfessional = null;
                  createdAt = Time.now();
                };
                bookings.add(nextBookingId, booking);

                // Update booking history
                let history = switch (bookingHistory.get(caller)) {
                  case (?existing) {
                    { existing with count = existing.count + 1 };
                  };
                  case (null) {
                    {
                      customer = caller;
                      count = 1;
                    };
                  };
                };
                bookingHistory.add(caller, history);

                nextBookingId += 1;
                booking.id;
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bookings");
    };

    let result = List.empty<Booking>();
    for ((_, booking) in bookings.entries()) {
      if (booking.customer == caller) {
        result.add(booking);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.customer != caller) {
          Runtime.trap("Unauthorized: Can only cancel your own bookings");
        };
        if (booking.status != #pending) {
          Runtime.trap("Cannot cancel booking with status other than pending");
        };
        let updatedBooking = { booking with status = #cancelled };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  // Professional Booking Management
  public query ({ caller }) func getAssignedBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view assigned bookings");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) {
        switch (profile.professional) {
          case (null) { Runtime.trap("Only professionals can view assigned bookings") };
          case (?_) {
            let result = List.empty<Booking>();
            for ((_, booking) in bookings.entries()) {
              switch (booking.assignedProfessional) {
                case (?professional) {
                  if (professional == caller) {
                    result.add(booking);
                  };
                };
                case (null) {};
              };
            };
            result.toArray();
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update booking status");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("User not registered") };
      case (?profile) {
        switch (profile.professional) {
          case (null) { Runtime.trap("Only professionals can update booking status") };
          case (?_) {
            switch (bookings.get(bookingId)) {
              case (null) { Runtime.trap("Booking not found") };
              case (?booking) {
                switch (booking.assignedProfessional) {
                  case (?professional) {
                    if (professional != caller) {
                      Runtime.trap("Unauthorized: Can only update bookings assigned to you");
                    };
                  };
                  case (null) {
                    Runtime.trap("Booking not assigned to any professional");
                  };
                };

                let validTransition = switch (booking.status, status) {
                  case (#confirmed, #inProgress) { true };
                  case (#inProgress, #completed) { true };
                  case (_) { false };
                };

                if (not validTransition) {
                  Runtime.trap("Invalid status transition");
                };

                let updatedBooking = { booking with status };
                bookings.add(bookingId, updatedBooking);
              };
            };
          };
        };
      };
    };
  };

  // Admin Booking Assignment
  public shared ({ caller }) func assignBookingToProfessional(bookingId : Nat, professional : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign bookings");
    };

    switch (users.get(professional)) {
      case (null) { Runtime.trap("Professional not found") };
      case (?profile) {
        switch (profile.professional) {
          case (null) { Runtime.trap("User is not a professional") };
          case (?_) {
            switch (bookings.get(bookingId)) {
              case (null) { Runtime.trap("Booking not found") };
              case (?booking) {
                let updatedBooking = {
                  booking with
                  assignedProfessional = ?professional;
                  status = #confirmed;
                };
                bookings.add(bookingId, updatedBooking);
              };
            };
          };
        };
      };
    };
  };

  // Admin Override Booking Status
  public shared ({ caller }) func adminUpdateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking = { booking with status };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  // Platform Stats (Admin Only)
  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view platform stats");
    };

    {
      totalUsers = users.size();
      totalProfessionals = getTotalProfessionals();
      totalBookings = bookings.size();
      totalCompletedBookings = getTotalCompletedBookings();
      totalRevenue = getTotalRevenue();
    };
  };

  // Get All Customers (Admin Only)
  public query ({ caller }) func getAllCustomers() : async [CustomerInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all customers");
    };

    let customers = List.empty<(Principal, UserProfile)>();
    for ((principal, profile) in users.entries()) {
      switch (profile.professional) {
        case (null) {
          customers.add((principal, profile));
        };
        case (?_) {};
      };
    };

    let customerList = customers.toArray();
    let result = List.empty<CustomerInfo>();
    for ((principal, profile) in customerList.values()) {
      let customerBookings = switch (bookingHistory.get(principal)) {
        case (?history) { history.count };
        case (null) { 0 };
      };
      result.add({
        principal;
        mobileNumber = profile.mobileNumber;
        bookingCount = customerBookings;
      });
    };

    result.toArray();
  };

  // Admin Only: Remove User Profile
  public shared ({ caller }) func adminRemoveUser(userPrincipal : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove users");
    };
    switch (users.get(userPrincipal)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        users.remove(userPrincipal);
      };
    };
  };

  // Pre-seed Services (Admin Only)
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize");
    };

    if (isInitialized) { Runtime.trap("Already initialized") };

    let initialServices : [Service] = [
      {
        id = 1;
        name = "Laptop Screen Repair";
        description = "Fix broken laptop screens";
        category = #laptopRepair;
        minPrice = 5000;
        maxPrice = 15000;
      },
      {
        id = 2;
        name = "Laptop Battery Replacement";
        description = "Replace laptop batteries";
        category = #laptopRepair;
        minPrice = 2000;
        maxPrice = 6000;
      },
      {
        id = 3;
        name = "Desktop Power Supply Replacement";
        description = "Replace desktop power supplies";
        category = #desktopRepair;
        minPrice = 5000;
        maxPrice = 15000;
      },
      {
        id = 4;
        name = "Desktop Motherboard Repair";
        description = "Repair desktop motherboards";
        category = #desktopRepair;
        minPrice = 10000;
        maxPrice = 30000;
      },
      {
        id = 5;
        name = "New Laptop Sales";
        description = "Sell new laptops";
        category = #computerSales;
        minPrice = 30000;
        maxPrice = 100000;
      },
      {
        id = 6;
        name = "New Desktop Sales";
        description = "Sell new desktops";
        category = #computerSales;
        minPrice = 25000;
        maxPrice = 80000;
      },
      {
        id = 7;
        name = "Laptop Bags";
        description = "Offer laptop bags and sleeves";
        category = #accessoriesSales;
        minPrice = 500;
        maxPrice = 2000;
      },
      {
        id = 8;
        name = "USB Drives";
        description = "Sell USB flash drives";
        category = #accessoriesSales;
        minPrice = 200;
        maxPrice = 1000;
      },
      {
        id = 9;
        name = "WiFi Router Setup";
        description = "Set up home WiFi routers";
        category = #networkSetup;
        minPrice = 2000;
        maxPrice = 5000;
      },
      {
        id = 10;
        name = "LAN Cabling";
        description = "Install LAN cables";
        category = #networkSetup;
        minPrice = 1000;
        maxPrice = 4000;
      },
      {
        id = 11;
        name = "Data Recovery";
        description = "Recover lost data";
        category = #dataRecovery;
        minPrice = 5000;
        maxPrice = 20000;
      },
      {
        id = 12;
        name = "Virus Removal";
        description = "Remove viruses and malware";
        category = #dataRecovery;
        minPrice = 2000;
        maxPrice = 8000;
      },
    ];

    for (service in initialServices.values()) {
      services.add(service.id, service);
    };

    nextServiceId := 13;
    isInitialized := true;
  };

  // Admin Only: Get All Bookings
  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  // Admin Only: List Professionals
  public query ({ caller }) func listProfessionals() : async [ProfessionalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list professionals");
    };

    let result = List.empty<ProfessionalInfo>();

    for ((principal, userProfile) in users.entries()) {
      switch (userProfile.professional) {
        case (?professional) {
          result.add({
            principal;
            displayName = professional.displayName;
            category = professional.category;
            latitude = professional.latitude;
            longitude = professional.longitude;
          });
        };
        case (null) {};
      };
    };

    result.toArray();
  };

  public shared ({ caller }) func sendMessage(bookingId : Nat, text : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let senderRole = switch (users.get(caller)) {
          case (null) { Runtime.trap("User profile not found") };
          case (?profile) {
            switch (profile.professional) {
              case (null) { "customer" };
              case (?_) { "professional" };
            };
          };
        };

        if (
          (caller != booking.customer) and
          (not checkProfessional(booking.assignedProfessional, caller))
        ) {
          Runtime.trap("Unauthorized: Not a participant of the booking");
        };

        let message = {
          id = nextMessageId;
          bookingId;
          sender = caller;
          senderRole;
          text;
          timestamp = Time.now();
        };

        messages.add(nextMessageId, message);
        nextMessageId += 1;
        message.id;
      };
    };
  };

  func checkProfessional(assignedProfessional : ?Principal, caller : Principal) : Bool {
    switch (assignedProfessional) {
      case (?professional) { professional == caller };
      case (null) { false };
    };
  };

  public query ({ caller }) func getMessages(bookingId : Nat) : async [ChatMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (
          (caller != booking.customer) and
          (not checkProfessional(booking.assignedProfessional, caller))
        ) {
          Runtime.trap("Unauthorized: Not a participant of the booking");
        };

        let result = List.empty<ChatMessage>();
        for ((_, message) in messages.entries()) {
          if (message.bookingId == bookingId) {
            result.add(message);
          };
        };
        result.toArray();
      };
    };
  };

  public shared ({ caller }) func updateTechnicianLocation(lat : Float, lng : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update location");
    };

    switch (users.get(caller)) {
      case (null) { Runtime.trap("Caller not registered") };
      case (?profile) {
        switch (profile.professional) {
          case (null) { Runtime.trap("Only professionals can update location") };
          case (?professional) {
            let updatedProfessional = {
              professional with
              latitude = ?lat;
              longitude = ?lng;
            };

            let updatedProfile = {
              profile with professional = ?updatedProfessional;
            };

            users.add(caller, updatedProfile);
          };
        };
      };
    };
  };

  public query ({ caller }) func getNearbyTechnicians() : async [ProfessionalInfo] {
    let result = List.empty<ProfessionalInfo>();

    for ((principal, userProfile) in users.entries()) {
      switch (userProfile.professional) {
        case (?professional) {
          switch (professional.latitude, professional.longitude) {
            case (?_, ?_) {
              result.add({
                principal;
                displayName = professional.displayName;
                category = professional.category;
                latitude = professional.latitude;
                longitude = professional.longitude;
              });
            };
            case (_) {};
          };
        };
        case (null) {};
      };
    };

    result.toArray();
  };
};
