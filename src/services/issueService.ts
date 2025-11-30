import api from './api';
import AppConstants from '../config/constants';

export interface BlockIssue {
    id: number;
    ref_no?: string;
    issue?: string;
    description?: string;
    title?: string;
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
    priority?: {
        id: number;
        label?: string;
        priority?: string;
        btn_class?: string;
    };
    issue_status?: {
        id: number;
        name?: string;
        label?: string;
    };
    issue_type?: {
        id: number;
        name?: string;
    };
    reported_by?: number;
    reportedBy?: {
        id: number;
        name?: string;
        email?: string;
    };
    assigned_to?: number;
    assignedTo?: {
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
    contact_method?: {
        id: number;
        name?: string;
    };
    contact_name?: string;
    contact_mobile?: string;
    contact_email?: string;
    phone_number?: string;
    preferred_start_date_time?: string;
    preferred_end_date_time?: string;
    note_for_access?: string;
    comment?: string;
    issued_date_time?: string;
    images?: Array<{
        id: number;
        image_path?: string;
        url?: string;
        created_at?: string;
    }>;
    is_mobile?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

class IssueService {
    /**
     * Get block issue details by ID
     */
    async getIssueById(id: number): Promise<BlockIssue> {
        try {
            const response = await api.get<BlockIssue>(
                `${AppConstants.endpoints.blockIssueDetail}/${id}`
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 404) {
                throw new Error('Issue not found');
            }

            return response.data;
        } catch (error: any) {
            console.error('Get issue details error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to load issue details');
        }
    }

    /**
     * Get issue photos
     */
    async getIssuePhotos(id: number): Promise<any[]> {
        try {
            const response = await api.get<{ success: boolean; data: any[] }>(
                `${AppConstants.endpoints.blockIssueDetail}/${id}/photos`
            );

            if (response.status === 401) {
                throw new Error('Authentication failed - please login again');
            }

            if (response.status === 404) {
                throw new Error('Issue not found');
            }

            return response.data.data || [];
        } catch (error: any) {
            console.error('Get issue photos error:', error);
            throw new Error(error.response?.data?.message || error.message || 'Failed to load issue photos');
        }
    }
}

export default new IssueService();

