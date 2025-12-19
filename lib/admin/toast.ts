import { toast } from "sonner";

export const adminToast = {
  success: (message: string, description?: string) => {
    return toast.success(message, {
      description,
      duration: 4000,
    });
  },
  
  error: (message: string, description?: string) => {
    return toast.error(message, {
      description,
      duration: 6000,
    });
  },
  
  info: (message: string, description?: string) => {
    return toast.info(message, {
      description,
      duration: 4000,
    });
  },
  
  warning: (message: string, description?: string) => {
    return toast.warning(message, {
      description,
      duration: 5000,
    });
  },
  
  // Specific admin action toasts
  reviewApproved: (count: number) => {
    return adminToast.success(
      `Review${count > 1 ? 's' : ''} approved`,
      `${count} review${count > 1 ? 's' : ''} ${count > 1 ? 'have' : 'has'} been published`
    );
  },
  
  reviewRejected: (count: number) => {
    return adminToast.info(
      `Review${count > 1 ? 's' : ''} rejected`,
      `${count} review${count > 1 ? 's' : ''} ${count > 1 ? 'have' : 'has'} been rejected`
    );
  },
  
  reviewDeleted: (count: number) => {
    return adminToast.warning(
      `Review${count > 1 ? 's' : ''} deleted`,
      `${count} review${count > 1 ? 's' : ''} ${count > 1 ? 'have' : 'has'} been permanently deleted`
    );
  },
  
  orderStatusUpdated: (orderId: string, status: string) => {
    return adminToast.success(
      "Order status updated",
      `Order #${orderId.substring(0, 8)} marked as ${status}`
    );
  },
  
  driverAdded: (name: string) => {
    return adminToast.success(
      "Driver added",
      `${name} has been added to the driver pool`
    );
  },
  
  driverUpdated: (name: string) => {
    return adminToast.success(
      "Driver updated",
      `${name}'s information has been updated`
    );
  },
  
  driverDeleted: (name: string) => {
    return adminToast.warning(
      "Driver removed",
      `${name} has been removed from the driver pool`
    );
  },
  
  bulkAction: (action: string, count: number, type: string) => {
    return adminToast.success(
      `Bulk ${action} completed`,
      `${count} ${type}${count > 1 ? 's' : ''} ${action}d`
    );
  },
};
