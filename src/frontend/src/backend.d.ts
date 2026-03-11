import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    id: bigint;
    bookingId: bigint;
    text: string;
    sender: Principal;
    timestamp: bigint;
    senderRole: string;
}
export interface BrandingConfig {
    tagline: string;
    primaryColor: string;
    logoDataUrl?: string;
    siteName: string;
    footerText: string;
}
export interface Booking {
    id: bigint;
    status: BookingStatus;
    customer: Principal;
    date: string;
    createdAt: bigint;
    assignedProfessional?: Principal;
    address: string;
    serviceId: bigint;
    timeSlot: string;
}
export interface Service {
    id: bigint;
    name: string;
    description: string;
    maxPrice: bigint;
    category: ServiceCategory;
    minPrice: bigint;
}
export interface ProfessionalProfile {
    latitude?: number;
    displayName: string;
    longitude?: number;
    category: ServiceCategory;
}
export interface ProfessionalInfo {
    latitude?: number;
    principal: Principal;
    displayName: string;
    longitude?: number;
    category: ServiceCategory;
}
export interface PlatformStats {
    totalProfessionals: bigint;
    totalBookings: bigint;
    totalUsers: bigint;
    totalRevenue: bigint;
    totalCompletedBookings: bigint;
}
export interface CustomerInfo {
    principal: Principal;
    mobileNumber?: string;
    bookingCount: bigint;
}
export interface UserProfile {
    role: UserRole;
    mobileNumber?: string;
    professional?: ProfessionalProfile;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed",
    inProgress = "inProgress"
}
export enum ServiceCategory {
    dataRecovery = "dataRecovery",
    desktopRepair = "desktopRepair",
    networkSetup = "networkSetup",
    laptopRepair = "laptopRepair",
    accessoriesSales = "accessoriesSales",
    computerSales = "computerSales"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addService(name: string, description: string, category: ServiceCategory, minPrice: bigint, maxPrice: bigint): Promise<bigint>;
    adminRemoveUser(userPrincipal: Principal): Promise<void>;
    adminUpdateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    assignBookingToProfessional(bookingId: bigint, professional: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    createBooking(serviceId: bigint, date: string, timeSlot: string, address: string): Promise<bigint>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllCustomers(): Promise<Array<CustomerInfo>>;
    getAssignedBookings(): Promise<Array<Booking>>;
    getBrandingConfig(): Promise<BrandingConfig>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMessages(bookingId: bigint): Promise<Array<ChatMessage>>;
    getMyBookings(): Promise<Array<Booking>>;
    getNearbyTechnicians(): Promise<Array<ProfessionalInfo>>;
    getPlatformStats(): Promise<PlatformStats>;
    getServicesByCategory(category: ServiceCategory | null): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isAdminCaller(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listProfessionals(): Promise<Array<ProfessionalInfo>>;
    listServices(): Promise<Array<Service>>;
    registerCustomer(): Promise<void>;
    registerProfessional(displayName: string, category: ServiceCategory): Promise<void>;
    removeService(serviceId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(bookingId: bigint, text: string): Promise<bigint>;
    setBrandingConfig(config: BrandingConfig): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    updateMobileNumber(mobileNumber: string): Promise<void>;
    updateService(serviceId: bigint, name: string, description: string, category: ServiceCategory, minPrice: bigint, maxPrice: bigint): Promise<void>;
    updateTechnicianLocation(lat: number, lng: number): Promise<void>;
}
