import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";

module {
  public type OldServiceCategory = {
    #cleaning;
    #plumbing;
    #electrician;
    #carpentry;
    #painting;
    #acRepair;
  };

  public type OldService = {
    id : Nat;
    name : Text;
    description : Text;
    category : OldServiceCategory;
    minPrice : Nat;
    maxPrice : Nat;
  };

  public type OldBookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type OldBooking = {
    id : Nat;
    customer : Principal.Principal;
    serviceId : Nat;
    date : Text;
    timeSlot : Text;
    address : Text;
    status : OldBookingStatus;
    assignedProfessional : ?Principal.Principal;
    createdAt : Int;
  };

  public type OldProfessionalProfile = {
    displayName : Text;
    category : OldServiceCategory;
  };

  public type OldUserProfile = {
    role : {
      #admin;
      #user;
      #guest;
    };
    professional : ?OldProfessionalProfile;
  };

  public type OldActor = {
    users : Map.Map<Principal.Principal, OldUserProfile>;
    services : Map.Map<Nat, OldService>;
    bookings : Map.Map<Nat, OldBooking>;
    nextServiceId : Nat;
    nextBookingId : Nat;
    isInitialized : Bool;
  };

  public type NewServiceCategory = {
    #laptopRepair;
    #desktopRepair;
    #computerSales;
    #accessoriesSales;
    #networkSetup;
    #dataRecovery;
  };

  public type NewService = {
    id : Nat;
    name : Text;
    description : Text;
    category : NewServiceCategory;
    minPrice : Nat;
    maxPrice : Nat;
  };

  public type NewBookingStatus = {
    #pending;
    #confirmed;
    #inProgress;
    #completed;
    #cancelled;
  };

  public type NewBooking = {
    id : Nat;
    customer : Principal.Principal;
    serviceId : Nat;
    date : Text;
    timeSlot : Text;
    address : Text;
    status : NewBookingStatus;
    assignedProfessional : ?Principal.Principal;
    createdAt : Int;
  };

  public type NewProfessionalProfile = {
    displayName : Text;
    category : NewServiceCategory;
  };

  public type NewUserProfile = {
    role : {
      #admin;
      #user;
      #guest;
    };
    professional : ?NewProfessionalProfile;
  };

  public type NewActor = {
    users : Map.Map<Principal.Principal, NewUserProfile>;
    services : Map.Map<Nat, NewService>;
    bookings : Map.Map<Nat, NewBooking>;
    nextServiceId : Nat;
    nextBookingId : Nat;
    isInitialized : Bool;
  };

  func convertCategory(oldCategory : OldServiceCategory) : NewServiceCategory {
    switch (oldCategory) {
      case (#cleaning) { #laptopRepair };
      case (#plumbing) { #desktopRepair };
      case (#electrician) { #computerSales };
      case (#carpentry) { #accessoriesSales };
      case (#painting) { #networkSetup };
      case (#acRepair) { #dataRecovery };
    };
  };

  func convertService(oldService : OldService) : NewService {
    {
      oldService with category = convertCategory(oldService.category)
    };
  };

  func convertProfessionalProfile(oldProfile : OldProfessionalProfile) : NewProfessionalProfile {
    {
      oldProfile with category = convertCategory(oldProfile.category)
    };
  };

  func convertUserProfile(oldUserProfile : OldUserProfile) : NewUserProfile {
    {
      oldUserProfile with professional = switch (oldUserProfile.professional) {
        case (null) { null };
        case (?oldProfile) { ?convertProfessionalProfile(oldProfile) };
      }
    };
  };

  func convertBookingStatus(oldStatus : OldBookingStatus) : NewBookingStatus {
    switch (oldStatus) {
      case (#pending) { #pending };
      case (#confirmed) { #confirmed };
      case (#inProgress) { #inProgress };
      case (#completed) { #completed };
      case (#cancelled) { #cancelled };
    };
  };

  func convertBooking(oldBooking : OldBooking) : NewBooking {
    {
      oldBooking with status = convertBookingStatus(oldBooking.status)
    };
  };

  public func run(old : OldActor) : NewActor {
    let newServices = old.services.map<Nat, OldService, NewService>(
      func(_id, oldService) {
        convertService(oldService);
      }
    );

    let newUsers = old.users.map<Principal.Principal, OldUserProfile, NewUserProfile>(
      func(_id, oldUserProfile) {
        convertUserProfile(oldUserProfile);
      }
    );

    let newBookings = old.bookings.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        convertBooking(oldBooking);
      }
    );

    {
      old with
      services = newServices;
      users = newUsers;
      bookings = newBookings;
    };
  };
};
