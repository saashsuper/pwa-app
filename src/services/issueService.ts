import api from './api';
import AppConstants from '../config/constants';

export interface Issue {
  id: number;
  block_id: number;
  block?: {
    id: number;
    name: string;
  };
  block_unit_id?: number;
  block_unit?: {
    id: number;
    unit_name: string;
    unit_code: string;
  };
  issue: string;
  description?: string;
  priority_id?: number;
  priority?: {
    id: number;
    name: string;
  };
  status: number;
  status_name?: string;
  issued_by_id?: number;
  issued_by?: {
    id: number;
    name: string;
    email: string;
  };
  assigned_to_id?: number;
  assigned_to?: {
    id: number;
    name: string;
    email: string;
  };
  resolved_at?: string;
  resolved_by_id?: number;
  images_count?: number;
  work_orders_count?: number;
  active_work_orders_count?: number;
  created_at: string;
  updated_at: string;
}

export type BlockIssue = Issue;

export interface IssueListResponse {
  success: boolean;
  data: Issue[];
  message?: string;
}

export interface IssueDetailResponse {
  success: boolean;
  data: Issue;
  message?: string;
}

class IssueService {
  /**
   * Get all issues for a block
   */
  async getIssuesByBlock(blockId: number, params?: {
    status?: string | number;
    priority?: string | number;
  }): Promise<Issue[]> {
    try {
      const response = await api.get<IssueListResponse>(
        `${AppConstants.endpoints.blocks}/${blockId}/issues`,
        { params }
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get block issues error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch issues');
    }
  }

  /**
   * Get issue by ID
   */
  async getIssueById(id: number): Promise<Issue> {
    try {
      const response = await api.get(
        `${AppConstants.endpoints.issues}/${id}`
      );
      // API returns { success, data } or raw object
      const data = response.data?.data ?? response.data;
      if (!data) throw new Error('Invalid issue response');
      return data as Issue;
    } catch (error: any) {
      console.error('Get issue error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch issue details');
    }
  }

  /**
   * Get create form lookup data (contact methods, issue types, property managers, users)
   */
  async getCreateData(): Promise<{
    contact_methods: { id: number; name: string }[];
    issue_types: { id: number; name: string }[];
    property_managers: { id: number; name: string; email: string }[];
    users: { id: number; name: string; email: string }[];
  }> {
    try {
      const response = await api.get<{ success: boolean; data: { contact_methods: any[]; issue_types: any[]; property_managers: any[]; users: any[] } }>(
        `${AppConstants.endpoints.issues}/create-data`
      );
      const data = response.data?.data;
      if (!data) throw new Error('Invalid create data response');
      return data;
    } catch (error: any) {
      console.error('Get create data error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch create form data');
    }
  }

  /**
   * Create a new block issue
   */
  async createIssue(payload: {
    block_id: number;
    assigned_to: number;
    reported_by?: number | null;
    issue: string;
    issue_type: string;
    priority_id: number;
    contact_details: string;
    contact_method_id: number;
    issue_details?: string;
    block_unit_id?: number | null;
    images?: File[];
  }): Promise<Issue> {
    try {
      const formData = new FormData();
      formData.append('block_id', String(payload.block_id));
      formData.append('assigned_to', String(payload.assigned_to));
      if (payload.reported_by) formData.append('reported_by', String(payload.reported_by));
      formData.append('issue', payload.issue);
      formData.append('issue_type', payload.issue_type);
      formData.append('priority_id', String(payload.priority_id));
      formData.append('contact_details', payload.contact_details);
      formData.append('contact_method_id', String(payload.contact_method_id));
      if (payload.issue_details) formData.append('issue_details', payload.issue_details);
      if (payload.block_unit_id) formData.append('block_unit_id', String(payload.block_unit_id));
      if (payload.images?.length) {
        payload.images.forEach((f) => formData.append('images[]', f));
      }
      const response = await api.post<{ success: boolean; data: Issue; message?: string }>(
        AppConstants.endpoints.issues,
        formData
      );
      const data = response.data?.data;
      if (!data) throw new Error(response.data?.message || 'Failed to create issue');
      return data as Issue;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.errors
        ? Object.values(error.response.data.errors || {}).flat().join(', ')
        : 'Failed to create issue';
      throw new Error(msg);
    }
  }

  /**
   * Get issues assigned to the authenticated property manager
   */
  async getMyIssues(params?: {
    status?: string | number;
    priority?: string | number;
    block_id?: number;
  }): Promise<Issue[]> {
    try {
      const response = await api.get<IssueListResponse>(
        `${AppConstants.endpoints.myIssues}`,
        { params }
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get my issues error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch assigned issues');
    }
  }
}

export default new IssueService();
