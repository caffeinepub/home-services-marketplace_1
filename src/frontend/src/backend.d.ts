import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Service {
    id: bigint;
    name: string;
    description: string;
    maxPrice: bigint;
    category: ServiceCategory;
    minPrice: bigint;
}
export interface ProfessionalProfile {
    displayName: string;
    category: ServiceCategory;
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
export interface PlatformStats {
    totalProfessionals: bigint;
    totalBookings: bigint;
    totalUsers: bigint;
    totalCompletedBookings: bigint;
}
export interface UserProfile {
    role: UserRole;
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
    cleaning = "cleaning",
    plumbing = "plumbing",
    painting = "painting",
    electrician = "electrician",
    acRepair = "acRepair",
    carpentry = "carpentry"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addService(name: string, description: string, category: ServiceCategory, minPrice: bigint, maxPrice: bigint): Promise<bigint>;
    assignBookingToProfessional(bookingId: bigint, professional: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    createBooking(serviceId: bigint, date: string, timeSlot: string, address: string): Promise<bigint>;
    getAssignedBookings(): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyBookings(): Promise<Array<Booking>>;
    getPlatformStats(): Promise<PlatformStats>;
    getServicesByCategory(category: ServiceCategory | null): Promise<Array<Service>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isAdminCaller(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listServices(): Promise<Array<Service>>;
    registerCustomer(): Promise<void>;
    registerProfessional(displayName: string, category: ServiceCategory): Promise<void>;
    removeService(serviceId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    updateService(serviceId: bigint, name: string, description: string, category: ServiceCategory, minPrice: bigint, maxPrice: bigint): Promise<void>;
}
