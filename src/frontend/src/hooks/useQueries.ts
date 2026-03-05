import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type Booking,
  BookingStatus,
  type PlatformStats,
  type ProfessionalInfo,
  type Service,
  ServiceCategory,
  type UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const queryKeys = {
  services: ["services"] as const,
  servicesByCategory: (cat: ServiceCategory | null) =>
    ["services", "category", cat] as const,
  myBookings: ["bookings", "my"] as const,
  assignedBookings: ["bookings", "assigned"] as const,
  platformStats: ["platform", "stats"] as const,
  userProfile: ["user", "profile"] as const,
  userRole: ["user", "role"] as const,
};

// ─── Services ─────────────────────────────────────────────────────────────────
export function useListServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: queryKeys.services,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listServices();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useServicesByCategory(category: ServiceCategory | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: queryKeys.servicesByCategory(category),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getServicesByCategory(category);
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export function useMyBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: queryKeys.myBookings,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignedBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: queryKeys.assignedBookings,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssignedBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── User ─────────────────────────────────────────────────────────────────────
export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: queryKeys.userProfile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: queryKeys.userRole,
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export function usePlatformStats() {
  const { actor, isFetching } = useActor();
  return useQuery<PlatformStats>({
    queryKey: queryKeys.platformStats,
    queryFn: async () => {
      if (!actor) {
        return {
          totalProfessionals: 0n,
          totalBookings: 0n,
          totalUsers: 0n,
          totalCompletedBookings: 0n,
          totalRevenue: 0n,
        };
      }
      return actor.getPlatformStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────
export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      date,
      timeSlot,
      address,
    }: {
      serviceId: bigint;
      date: string;
      timeSlot: string;
      address: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBooking(serviceId, date, timeSlot, address);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: bigint;
      status: BookingStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.assignedBookings,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformStats });
    },
  });
}

export function useRegisterCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.registerCustomer();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.userRole });
    },
  });
}

export function useRegisterProfessional() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      category,
    }: {
      displayName: string;
      category: ServiceCategory;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerProfessional(displayName, category);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
      void queryClient.invalidateQueries({ queryKey: queryKeys.userRole });
    },
  });
}

export function useAddService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      minPrice,
      maxPrice,
    }: {
      name: string;
      description: string;
      category: ServiceCategory;
      minPrice: bigint;
      maxPrice: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addService(name, description, category, minPrice, maxPrice);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      name,
      description,
      category,
      minPrice,
      maxPrice,
    }: {
      serviceId: bigint;
      name: string;
      description: string;
      category: ServiceCategory;
      minPrice: bigint;
      maxPrice: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateService(
        serviceId,
        name,
        description,
        category,
        minPrice,
        maxPrice,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
    },
  });
}

export function useRemoveService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeService(serviceId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services });
      void queryClient.invalidateQueries({ queryKey: queryKeys.platformStats });
    },
  });
}

// ─── Admin Bookings ───────────────────────────────────────────────────────────
export function useAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListProfessionals() {
  const { actor, isFetching } = useActor();
  return useQuery<ProfessionalInfo[]>({
    queryKey: ["professionals", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProfessionals();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAssignBookingToProfessional() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      professional,
    }: {
      bookingId: bigint;
      professional: Principal;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignBookingToProfessional(bookingId, professional);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings", "all"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.platformStats,
      });
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatPrice(price: bigint): string {
  return `$${Number(price)}`;
}

export function formatPriceRange(min: bigint, max: bigint): string {
  return `$${Number(min)} – $${Number(max)}`;
}

export function getCategoryLabel(cat: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    [ServiceCategory.laptopRepair]: "Laptop Repair",
    [ServiceCategory.desktopRepair]: "Desktop Repair",
    [ServiceCategory.computerSales]: "Computer Sales",
    [ServiceCategory.accessoriesSales]: "Accessories",
    [ServiceCategory.networkSetup]: "Network Setup",
    [ServiceCategory.dataRecovery]: "Data Recovery",
  };
  return labels[cat] ?? cat;
}

export function getStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    [BookingStatus.pending]: "Pending",
    [BookingStatus.confirmed]: "Confirmed",
    [BookingStatus.inProgress]: "In Progress",
    [BookingStatus.completed]: "Completed",
    [BookingStatus.cancelled]: "Cancelled",
  };
  return labels[status] ?? status;
}

export function getStatusClass(status: BookingStatus): string {
  const classes: Record<BookingStatus, string> = {
    [BookingStatus.pending]: "status-pending",
    [BookingStatus.confirmed]: "status-confirmed",
    [BookingStatus.inProgress]: "status-inProgress",
    [BookingStatus.completed]: "status-completed",
    [BookingStatus.cancelled]: "status-cancelled",
  };
  return classes[status] ?? "";
}

export function shortenPrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}
