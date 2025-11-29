import api from './api';
import AppConstants from '../config/constants';

export interface Inspection {
  id: number;
  progress: number;
  block?: {
    id: number;
    block_name: string;
  };
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export interface InspectionsResponse {
  data: Inspection[];
  message?: string;
}

class InspectionService {
  /**
   * Get my inspections
   */
  async getMyInspections(): Promise<Inspection[]> {
    try {
      const response = await api.get<InspectionsResponse>(
        AppConstants.endpoints.inspections
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      return response.data.data || [];
    } catch (error: any) {
      console.error('Get inspections error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to load inspections');
    }
  }

  /**
   * Get inspection details by ID
   */
  async getInspectionById(id: number): Promise<Inspection> {
    try {
      const response = await api.get<Inspection>(
        `${AppConstants.endpoints.inspectionDetail}/${id}`
      );

      if (response.status === 401) {
        throw new Error('Authentication failed - please login again');
      }

      if (response.status === 404) {
        throw new Error('Inspection not found');
      }

      return response.data;
    } catch (error: any) {
      console.error('Get inspection details error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to load inspection details');
    }
  }
}

export default new InspectionService();




