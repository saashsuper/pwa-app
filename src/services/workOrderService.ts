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
    rejection_reason?: string;
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
    pdf_path?: string;
    pdf_name?: string;
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

            // Handle API response structure: { success: true, data: { data: [...], current_page, total, etc. } }
            // Laravel pagination wraps the paginated data in a data property
            if (response.data && response.data.success && response.data.data) {
                // Check if data.data is an array (paginated response)
                if (Array.isArray(response.data.data.data)) {
                    return response.data.data.data;
                }
                // Check if data.data is already an array (non-paginated but wrapped)
                if (Array.isArray(response.data.data)) {
                    return response.data.data;
                }
            }
            
            // Handle direct array response (fallback)
            if (Array.isArray(response.data)) {
                return response.data;
            }
            
            // Fallback: return empty array if unexpected format
            console.warn('Unexpected API response format:', response.data);
            return [];
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

    /**
     * Pause a work order (changes status from "In Progress" to "On Hold")
     */
    async pause(id: number, reason?: string): Promise<WorkOrder> {
        try {
            const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
                `${AppConstants.endpoints.workOrderDetail}/${id}/pause`,
                reason ? { reason } : { reason: 'Work order paused by user' }
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 404) {
                throw new Error('Work order not found');
            }

            if (response.status === 422) {
                throw new Error(response.data?.message || 'Invalid pause request');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to pause work order');
        } catch (error: any) {
            console.error('Pause work order error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to pause work order');
        }
    }

    /**
     * Resume a paused work order (changes status from "On Hold" to "In Progress")
     */
    async resume(id: number): Promise<WorkOrder> {
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

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to resume work order');
        } catch (error: any) {
            console.error('Resume work order error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to resume work order');
        }
    }

    /**
     * Complete a work order (changes status to "Completed" and generates work docket)
     */
    async complete(id: number, comment?: string): Promise<WorkOrder> {
        try {
            const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
                `${AppConstants.endpoints.workOrderDetail}/${id}/complete`,
                comment ? { comment } : {}
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 404) {
                throw new Error('Work order not found');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to complete work order');
        } catch (error: any) {
            console.error('Complete work order error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to complete work order');
        }
    }

    /**
     * Accept a work order (Contractor Admin only)
     * Only allowed for scheduled work orders
     */
    async accept(id: number): Promise<WorkOrder> {
        try {
            const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
                `${AppConstants.endpoints.workOrderDetail}/${id}/accept`
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 403) {
                throw new Error(response.data?.message || 'You do not have permission to accept work orders');
            }

            if (response.status === 422) {
                throw new Error(response.data?.message || 'Cannot accept this work order');
            }

            if (response.status === 404) {
                throw new Error('Work order not found');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to accept work order');
        } catch (error: any) {
            console.error('Accept work order error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to accept work order');
        }
    }

    /**
     * Start a work order (changes status from "Accepted" to "In Progress")
     */
    async start(id: number): Promise<WorkOrder> {
        try {
            const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
                `${AppConstants.endpoints.workOrderDetail}/${id}/start`
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 403) {
                throw new Error(response.data?.message || 'You do not have permission to start work orders');
            }

            if (response.status === 422) {
                throw new Error(response.data?.message || 'Work order must be accepted before it can be started');
            }

            if (response.status === 404) {
                throw new Error('Work order not found');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to start work order');
        } catch (error: any) {
            console.error('Start work order error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to start work order');
        }
    }

    /**
     * Reject a work order (Contractor Admin only)
     * Only allowed for scheduled work orders
     * Requires a rejection reason
     */
    async reject(id: number, rejectionReason: string): Promise<WorkOrder> {
        try {
            const response = await api.post<{ success: boolean; message: string; data: WorkOrder }>(
                `${AppConstants.endpoints.workOrderDetail}/${id}/reject`,
                { rejection_reason: rejectionReason }
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 403) {
                throw new Error(response.data?.message || 'You do not have permission to reject work orders');
            }

            if (response.status === 422) {
                const errorMessage = response.data?.errors?.rejection_reason?.[0] 
                    || response.data?.message 
                    || 'Please provide a valid rejection reason (minimum 10 characters)';
                throw new Error(errorMessage);
            }

            if (response.status === 404) {
                throw new Error('Work order not found');
            }

            if (response.data.success) {
                return response.data.data;
            }

            throw new Error(response.data?.message || 'Failed to reject work order');
        } catch (error: any) {
            console.error('Reject work order error:', error);
            throw new Error(error.response?.data?.message || error.response?.data?.errors?.rejection_reason?.[0] || error.message || 'Failed to reject work order');
        }
    }

    /**
     * Download work docket PDF
     */
    async downloadWorkDocket(id: number): Promise<void> {
        try {
            // Use fetch for blob downloads as axios might have issues with blob responseType
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${AppConstants.apiUrl}${AppConstants.endpoints.workOrderDetail}/${id}/download-docket`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/pdf',
                    },
                }
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 404) {
                throw new Error('Work docket not found. Please ensure the work order is completed.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to download work docket: ${response.statusText}`);
            }

            // Create blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `work-docket-${id}.pdf`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Download work docket error:', error);
            throw new Error(error.message || 'Failed to download work docket');
        }
    }
}

export default new WorkOrderService();
