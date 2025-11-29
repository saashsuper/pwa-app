import api from './api';
import AppConstants from '../config/constants';

export interface WorkOrder {
  id: number;
  work?: string;
  issue?: string;
  ref_no?: string;
  status?: string | number | {
    id?: number;
    label?: string;
    value?: number;
    btn_class?: string;
    created_at?: string;
    updated_at?: string;
  };
  job_status?: {
    id: number;
    name: string;
  };
  priority?: {
    id: number;
    label?: string;
    value?: number;
    priority?: string;
    btn_class?: string;
    created_at?: string;
    updated_at?: string;
  } | string;
  block_unit?: {
    id: number;
    unit_no?: string;
    unit_name?: string;
  };
  block_building?: {
    id: number;
    name?: string;
  };
  block?: {
    id: number;
    name?: string;
    block_name?: string;
    address1?: string;
  };
  block_issue?: {
    id: number;
    issue?: string;
    ref_no?: string;
  };
  issued_date_time?: string;
  deadline_date?: string;
  preferred_start_date_time?: string;
  preferred_end_date_time?: string;
  contact_name?: string;
  contact_mobile?: string;
  contact_email?: string;
  note_for_access?: string;
  comment?: string;
  note?: string;
  contractor?: {
    id: number;
    name?: string;
    email?: string;
  };
  issued_by?: number;
  issuedBy?: {
    id: number;
    name?: string;
    email?: string;
  };
  images?: Array<{
    id?: number;
    image_path?: string;
    url?: string;
  } | string>;
  pdf_path?: string;
  pdf_name?: string;
  is_mobile?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface WorkOrdersResponse {
  data: WorkOrder[];
  message?: string;
}

class WorkOrderService {
  /**
   * Get my work orders
   */
  async getMyWorkOrders(): Promise<WorkOrder[]> {
    try {
      const response = await api.get<any>(
        AppConstants.endpoints.workOrders
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      // Handle paginated response (Laravel paginate returns { data: [...], current_page: ... })
      // or direct array response
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get work orders error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to load work orders');
    }
  }

  /**
   * Get work order details by ID
   */
  async getWorkOrderById(id: number): Promise<WorkOrder> {
    try {
      const response = await api.get<WorkOrder>(
        `${AppConstants.endpoints.workOrderDetail}/${id}`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      return response.data;
    } catch (error: any) {
      console.error('Get work order details error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to load work order details');
    }
  }

  /**
   * Start work order (update status to "In Progress")
   */
  async startWorkOrder(id: number): Promise<WorkOrder> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/start`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to start work order');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Start work order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to start work order');
    }
  }

  /**
   * Pause work order (update status to "On Hold")
   */
  async pauseWorkOrder(id: number): Promise<WorkOrder> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/pause`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to pause work order');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Pause work order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to pause work order');
    }
  }

  /**
   * Resume work order (update status from "On Hold" to "In Progress")
   */
  async resumeWorkOrder(id: number): Promise<WorkOrder> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/resume`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resume work order');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Resume work order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to resume work order');
    }
  }

  /**
   * Complete work order (update status to "Completed")
   */
  async completeWorkOrder(id: number): Promise<WorkOrder> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/complete`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to complete work order');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Complete work order error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to complete work order');
    }
  }
}

export default new WorkOrderService();




