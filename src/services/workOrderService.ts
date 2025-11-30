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
  notes?: Array<{
    id: number;
    note: string;
    note_type?: string;
    created_by?: number;
    created_at?: string;
    creator?: {
      id: number;
      name?: string;
      email?: string;
    };
  }>;
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
    image_name?: string;
    image_url?: string;
    url?: string;
    created_by?: number;
    creator?: {
      id: number;
      name?: string;
      email?: string;
    };
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
  async pauseWorkOrder(id: number, reason: string): Promise<WorkOrder> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/pause`,
        { reason }
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

  /**
   * Upload photos for work order
   */
  async uploadPhotos(id: number, photos: File[]): Promise<WorkOrder> {
    try {
      // Check current photo count
      const currentWorkOrder = await this.getWorkOrderById(id);
      const currentPhotoCount = currentWorkOrder.images?.length || 0;
      const totalPhotos = currentPhotoCount + photos.length;

      // Check if adding these photos would exceed the limit of 6
      if (totalPhotos > 6) {
        const allowed = 6 - currentPhotoCount;
        throw new Error(`Maximum 6 photos allowed. You can add ${allowed} more photo(s).`);
      }

      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });

      // Make request with FormData (axios will set Content-Type automatically)
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/photos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      if (response.status === 422 || !response.data.success) {
        throw new Error(response.data.message || 'Failed to upload photos');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Upload photos error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload photos');
    }
  }

  /**
   * Delete photo from work order
   */
  async deletePhoto(id: number, photoId: number): Promise<WorkOrder> {
    try {
      const response = await api.delete<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/photos/${photoId}`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 403) {
        throw new Error(response.data.message || 'You do not have permission to delete this photo');
      }

      if (response.status === 404) {
        throw new Error('Photo not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete photo');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Delete photo error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete photo');
    }
  }

  /**
   * Add note to work order
   */
  async addNote(id: number, note: string): Promise<WorkOrder> {
    try {
      const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/notes`,
        { note }
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 403) {
        throw new Error(response.data.message || 'You cannot add notes to a completed work order');
      }

      if (response.status === 404) {
        throw new Error('Work order not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add note');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Add note error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add note');
    }
  }

  /**
   * Delete note from work order
   */
  async deleteNote(id: number, noteId: number): Promise<WorkOrder> {
    try {
      const response = await api.delete<{ success: boolean; message: string; data: WorkOrder }>(
        `${AppConstants.endpoints.workOrderDetail}/${id}/notes/${noteId}`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 403) {
        throw new Error(response.data.message || 'You do not have permission to delete this note');
      }

      if (response.status === 404) {
        throw new Error('Note not found');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete note');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Delete note error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete note');
    }
  }
}

export default new WorkOrderService();




