import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderTwo from '../../layouts/headers/HeaderTwo';
import FooterTwo from '../../layouts/footers/FooterTwo';
import blockService, { Block } from '../../services/blockService';

const BlockList = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await blockService.getMyBlocks();
      setBlocks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load blocks');
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const displayedBlocks = (() => {
    let list = [...blocks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (block) =>
          block.name.toLowerCase().includes(query) ||
          block.address?.toLowerCase().includes(query) ||
          block.city?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      list = list.filter((block) => block.status === parseInt(statusFilter));
    }

    return list;
  })();

  return (
    <>
      <HeaderTwo />
      <div className="page-content-wrapper">
        {/* Header */}
        <div className="container">
          <div className="pt-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="mb-1">My Blocks</h4>
                <p className="mb-0 text-muted small">
                  {displayedBlocks.length} block{displayedBlocks.length !== 1 ? 's' : ''}
                  {(searchQuery || statusFilter !== 'all') && ` (filtered)`}
                </p>
              </div>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={loadBlocks}
                  disabled={loading}
                  title="Refresh"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <button
                  className="btn btn-sm btn-primary"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#filterOffcanvas"
                >
                  <i className="bi bi-filter"></i>
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError('')}
                  aria-label="Close"
                ></button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading blocks...</p>
              </div>
            ) : displayedBlocks.length === 0 ? (
              /* Empty State */
              <div className="text-center py-5">
                <i className="bi bi-building" style={{ fontSize: '64px', color: '#ccc' }}></i>
                <h5 className="mt-3">No Blocks Found</h5>
                <p className="text-muted">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No blocks match the selected filters.'
                    : "You don't have any blocks assigned yet."}
                </p>
              </div>
            ) : (
              /* Blocks List */
              <div className="row g-3">
                {displayedBlocks.map((block) => (
                  <div key={block.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-bold">{block.name}</h6>
                          <span
                            className={`badge ${block.status === 1 ? 'bg-success' : 'bg-secondary'}`}
                          >
                            {block.status === 1 ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {block.address && (
                          <p className="mb-2 text-muted small">
                            <i className="bi bi-geo-alt me-1"></i>
                            {block.address}
                            {block.city && `, ${block.city}`}
                            {block.state && `, ${block.state}`}
                            {block.zip_code && ` ${block.zip_code}`}
                          </p>
                        )}

                        {block.description && (
                          <p className="mb-2 text-muted small" style={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {block.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="d-flex align-items-center gap-3 mb-2">
                          {block.units_count !== undefined && (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-door-closed me-1 text-muted"></i>
                              <small className="text-muted">{block.units_count} Units</small>
                            </div>
                          )}
                          {block.issues_count !== undefined && (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-exclamation-triangle me-1 text-warning"></i>
                              <small className="text-warning fw-bold">{block.issues_count} Issues</small>
                            </div>
                          )}
                          {block.work_orders_count !== undefined && (
                            <div className="d-flex align-items-center">
                              <i className="bi bi-clipboard-check me-1 text-info"></i>
                              <small className="text-info fw-bold">{block.work_orders_count} WOs</small>
                            </div>
                          )}
                        </div>

                        <Link
                          to={`/blocks/${block.id}`}
                          className="btn btn-sm btn-outline-primary w-100"
                        >
                          View Details <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pb-3"></div>
          </div>
        </div>
      </div>

      {/* Filter Offcanvas */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="filterOffcanvas"
        aria-labelledby="filterOffcanvasLabel"
      >
        <div className="offcanvas-header d-flex justify-content-between align-items-center">
          <h5 className="offcanvas-title mb-0 me-3 flex-grow-1" id="filterOffcanvasLabel">
            Search & Filter
          </h5>
          <button
            type="button"
            className="btn-close flex-shrink-0"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <h6>Search</h6>
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search blocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-sm btn-outline-secondary mt-2 w-100"
                onClick={() => setSearchQuery('')}
              >
                <i className="bi bi-x me-1"></i>
                Clear Search
              </button>
            )}
          </div>

          <h6>Filter by Status</h6>
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button
              className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({blocks.length})
            </button>
            <button
              className={`btn btn-sm ${statusFilter === '1' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setStatusFilter('1')}
            >
              Active
            </button>
            <button
              className={`btn btn-sm ${statusFilter === '0' ? 'btn-secondary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('0')}
            >
              Inactive
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary w-100"
            data-bs-dismiss="offcanvas"
          >
            <i className="bi bi-check-lg me-2"></i>
            Apply
          </button>
        </div>
      </div>

      <FooterTwo />
    </>
  );
};

export default BlockList;
