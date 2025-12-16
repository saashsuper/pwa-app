import api from './api';
import AppConstants from '../config/constants';

export interface WorkOrder {
    id: number;
    ref_no?: string;
    work?: string;
    comment?: string;
    note?: string;
    note_for_access?: string;
    block?: {
        id: number;
        name?: string;
        block_name?: string;
        address1?: string;
        address2?: string;
        address3?: string;
    };
    block_unit?: {
        id: number;
        unit_no?: string;
        unit_name?: string;
        unit_code?: string;
    };
    block_building?: {
        id: number;
        name?: string;
    };
    block_issue?: {
        id: number;
        issue?: string;
        description?: string;
        title?: string;
    };
    priority?: {
        id: number;
        label?: string;
        priority?: string;
        btn_class?: string;
    } | string;
    job_status?: {
        id: number;
        name?: string;
        label?: string;
    } | string;
    status?: number;
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
    creator?: {
        id: number;
        name?: string;
        email?: string;
    };
    updater?: {
        id: number;
        name?: string;
        email?: string;
    };
    preferred_start_date_time?: string;
    preferred_end_date_time?: string;
    deadline_date?: string;
    acceptance_status?: string;
    images?: Array<{
        id: number;
        image_path?: string;
        image_name?: string;
        url?: string;
        created_at?: string;
        creator?: {
            id: number;
            name?: string;
            email?: string;
        };
    }>;
    notes?: Array<{
        id: number;
        note?: string;
        note_type?: string;
        created_at?: string;
        created_by?: number;
        creator?: {
            id: number;
            name?: string;
            email?: string;
        };
    }>;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

class WorkOrderService {
    /**
     * Get work orders assigned to current user
     */
    async getMyWorkOrders(): Promise<WorkOrder[]> {
        try {
            const response = await api.get<any>(
                AppConstants.endpoints.workOrders
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            // Handle paginated response (Laravel pagination returns { data: [...], current_page, total, etc. })
            // Or direct array response
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else {
                // Fallback: return empty array if unexpected format
                console.warn('Unexpected API response format:', response.data);
                return [];
            }
        } catch (error: any) {
            console.error('Get my work orders error:', error);
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
     * Add a note to a work order
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
                throw new Error(response.data?.message || 'Cannot add notes to a completed work order');
            }

            if (response.status === 404) {
                throw new Error('Work order not found');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to add note');
        } catch (error: any) {
            console.error('Add note error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to add note');
        }
    }

    /**
     * Delete a note from a work order
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
                throw new Error(response.data?.message || 'Cannot delete notes from a completed work order');
            }

            if (response.status === 404) {
                throw new Error('Note not found');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to delete note');
        } catch (error: any) {
            console.error('Delete note error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete note');
        }
    }
}

export default new WorkOrderService();
