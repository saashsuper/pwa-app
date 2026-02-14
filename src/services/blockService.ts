import api from './api';
import AppConstants from '../config/constants';

export interface Block {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  description?: string;
  status?: number;
  property_manager_id?: number;
  property_manager?: {
    id: number;
    name: string;
    email: string;
  };
  units_count?: number;
  issues_count?: number;
  work_orders_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BlockListResponse {
  success: boolean;
  data: Block[];
  message?: string;
}

export interface BlockDetailResponse {
  success: boolean;
  data: Block;
  message?: string;
}

export interface BlockUnit {
  id: number;
  block_id: number;
  unit_code?: string;
  unit_name?: string;
  owners_name?: string;
  email?: string;
  mobile_no?: string;
  phone_number?: string;
  address1?: string;
  status?: string;
  active_issues_count?: number;
  active_work_orders_count?: number;
  created_at: string;
  updated_at: string;
}

export interface UnitDetail extends BlockUnit {
  address2?: string;
  address3?: string;
  letting_agent?: string;
  misc_info?: string;
  resident?: boolean;
  salutation?: string;
  zip?: string;
  block?: { id: number; name: string; address?: string };
  building?: { id: number; name: string };
  unit_type?: { id: number; name: string };
  state?: string;
  country?: string;
  issues?: any[];
  work_orders?: any[];
}

export interface BlockUnitsResponse {
  success: boolean;
  data: BlockUnit[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

class BlockService {
  /**
   * Get all blocks (for property manager - only assigned blocks)
   */
  async getBlocks(params?: {
    search?: string;
    status?: string | number;
    page?: number;
    per_page?: number;
  }): Promise<Block[]> {
    try {
      const response = await api.get<BlockListResponse>(
        `${AppConstants.endpoints.blocks}`,
        { params }
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get blocks error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch blocks');
    }
  }

  /**
   * Get block by ID with details
   */
  async getBlockById(id: number): Promise<Block> {
    try {
      const response = await api.get<BlockDetailResponse>(
        `${AppConstants.endpoints.blocks}/${id}`
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Get block error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch block details');
    }
  }

  /**
   * Get unit details by block and unit ID (full info, issues, work orders)
   */
  async getUnitById(blockId: number, unitId: number): Promise<UnitDetail> {
    try {
      const response = await api.get(
        `${AppConstants.endpoints.blocks}/${blockId}/units/${unitId}`
      );
      const data = response.data?.data ?? response.data;
      if (!data) throw new Error('Invalid unit response');
      return data as UnitDetail;
    } catch (error: any) {
      console.error('Get unit error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch unit details');
    }
  }

  /**
   * Get paginated units for a block (descending by created_at)
   */
  async getUnitsByBlock(
    blockId: number,
    params?: { page?: number; per_page?: number }
  ): Promise<{ units: BlockUnit[]; meta: BlockUnitsResponse['meta'] }> {
    try {
      const response = await api.get<BlockUnitsResponse>(
        `${AppConstants.endpoints.blocks}/${blockId}/units`,
        { params }
      );
      return {
        units: response.data.data || [],
        meta: response.data.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: null,
          to: null,
        },
      };
    } catch (error: any) {
      console.error('Get block units error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch units');
    }
  }

  /**
   * Get blocks assigned to the authenticated property manager
   */
  async getMyBlocks(params?: {
    search?: string;
    status?: string | number;
  }): Promise<Block[]> {
    try {
      const response = await api.get<BlockListResponse>(
        `${AppConstants.endpoints.myBlocks}`,
        { params }
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get my blocks error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch assigned blocks');
    }
  }
}

export default new BlockService();
