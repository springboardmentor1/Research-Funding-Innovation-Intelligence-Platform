import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, Public as PublicIcon } from '@mui/icons-material';
import patentService from '../../services/patentService';

const PatentSearch = ({ onPatentsImported, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatents, setSelectedPatents] = useState(new Set());
  const [success, setSuccess] = useState('');

  const handleSearchTermChangeRef = useRef((e) => {
    setSearchTerm(e.target.value);
  });

  const handleSearchTermChange = handleSearchTermChangeRef.current;

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResults([]);
    setSelectedPatents(new Set());

    try {
      const response = await patentService.searchPatentsExternal(searchTerm);
      
      if (response && response.data) {
        setSearchResults(response.data);
      } else if (response && response.results) {
        setSearchResults(response.results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.detail || 'Failed to search patents. Make sure Lens API is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatent = (patent) => {
    const newSelected = new Set(selectedPatents);
    if (newSelected.has(patent.lens_id)) {
      newSelected.delete(patent.lens_id);
    } else {
      newSelected.add(patent.lens_id);
    }
    setSelectedPatents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPatents.size === searchResults.length) {
      setSelectedPatents(new Set());
    } else {
      setSelectedPatents(new Set(searchResults.map(p => p.lens_id)));
    }
  };

  const convertLensPatentToFormData = (lensPatent) => {
    // Extract relevant data from Lens API response
    const biblio = lensPatent.biblio || {};
    const parties = biblio.parties || {};
    const assignees = parties.assignees || [];
    const inventors = parties.inventors || [];

    return {
      title: biblio.title?.text || biblio.title || '',
      abstract: biblio.abstract?.text || biblio.abstract || '',
      inventors: inventors
        .map(inv => inv.extracted_name?.value || inv.name)
        .filter(Boolean)
        .join(', '),
      assignee: assignees
        .map(assignee => assignee.extracted_name?.value || assignee.name)
        .filter(Boolean)
        .join(', '),
      filing_date: biblio.date_published || '',
      publication_date: biblio.date_published || '',
      technology_area: biblio.subject || biblio.technology || '',
      country: lensPatent.jurisdiction || '',
      status: 'Pending' // Default status for imported patents
    };
  };

  const handleImportSelected = async () => {
    if (selectedPatents.size === 0) {
      setError('Please select at least one patent to import');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');

    try {
      const patentsToImport = searchResults.filter(p => selectedPatents.has(p.lens_id));
      
      for (const patent of patentsToImport) {
        const patentData = convertLensPatentToFormData(patent);
        await patentService.createPatent(patentData);
      }

      setSuccess(`Successfully imported ${selectedPatents.size} patent(s)!`);
      setSelectedPatents(new Set());

      if (onPatentsImported) {
        onPatentsImported();
      }

      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to import patents');
    } finally {
      setImporting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // If onClose is provided, render as a Dialog
  if (onClose) {
    return (
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={false}
        PaperProps={{
          sx: {
            background: '#1A1A2E',
            border: '1px solid rgba(124, 58, 237, 0.15)',
            borderRadius: 2,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 3,
          borderBottom: '1px solid rgba(124, 58, 237, 0.1)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
            }}>
              <SearchIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight={600}
                sx={{
                  color: 'white',
                  fontSize: '1.25rem',
                  lineHeight: 1.3,
                }}
              >
                Search & Import Patents
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)', 
                  mt: 0.5,
                  fontSize: '0.875rem',
                  lineHeight: 1.4
                }}
              >
                Search patents from external databases and import them to your portfolio
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Search patents by title, technology, inventor, or assignee..."
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(124, 58, 237, 0.05)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      borderRadius: 2,
                      color: 'white',
                      '&:hover': {
                        border: '1px solid rgba(124, 58, 237, 0.4)',
                      },
                      '&.Mui-focused': {
                        background: 'rgba(124, 58, 237, 0.08)',
                        border: '1px solid rgba(124, 58, 237, 0.6)',
                        boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: '#A78BFA',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.4)',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 3,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                    },
                  }}
                >
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </Box>
            </Box>

            {searchResults.length > 0 && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Found {searchResults.length} patent(s)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPatents.size === searchResults.length && searchResults.length > 0}
                        indeterminate={selectedPatents.size > 0 && selectedPatents.size < searchResults.length}
                        onChange={handleSelectAll}
                        sx={{
                          color: '#A78BFA',
                          '&.Mui-checked': {
                            color: '#7C3AED',
                          },
                        }}
                      />
                    }
                    label="Select All"
                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleImportSelected}
                    disabled={selectedPatents.size === 0 || importing}
                    startIcon={importing ? <CircularProgress size={20} /> : <AddIcon />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 500,
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                      },
                    }}
                  >
                    {importing ? 'Importing...' : `Import ${selectedPatents.size} Selected`}
                  </Button>
                </Box>
              </Box>
            )}

            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress sx={{ color: '#7C3AED' }} />
              </Box>
            )}

            <Grid container spacing={3}>
              {searchResults.map((patent, index) => {
                const biblio = patent.biblio || {};
                const isSelected = selectedPatents.has(patent.lens_id);

                return (
                  <Grid item xs={12} md={6} key={patent.lens_id || index}>
                    <Card
                      elevation={0}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
                        border: isSelected ? '2px solid #7C3AED' : '1px solid rgba(124, 58, 237, 0.1)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.15)',
                          borderColor: 'rgba(124, 58, 237, 0.3)',
                        },
                      }}
                      onClick={() => handleSelectPatent(patent)}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                          <Checkbox
                            checked={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPatent(patent);
                            }}
                            sx={{
                              color: '#A78BFA',
                              '&.Mui-checked': {
                                color: '#7C3AED',
                              },
                            }}
                          />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              fontWeight={600}
                              sx={{
                                color: 'white',
                                fontSize: '1rem',
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {biblio.title?.text || biblio.title || 'Untitled Patent'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          {patent.jurisdiction && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PublicIcon sx={{ fontSize: 16, color: '#A78BFA' }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                {patent.jurisdiction}
                              </Typography>
                            </Box>
                          )}

                          {biblio.date_published && (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              Published: {new Date(biblio.date_published).toLocaleDateString()}
                            </Typography>
                          )}

                          {patent.doc_number && (
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              Doc #: {patent.doc_number}
                            </Typography>
                          )}
                        </Box>

                        {biblio.abstract && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.5)',
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {biblio.abstract.text || biblio.abstract}
                          </Typography>
                        )}
                      </CardContent>

                      <CardActions sx={{ p: 2, pt: 0, borderTop: '1px solid rgba(124, 58, 237, 0.1)' }}>
                        <Chip
                          label={isSelected ? 'Selected' : 'Click to select'}
                          size="small"
                          color={isSelected ? 'primary' : 'default'}
                          sx={{
                            background: isSelected
                              ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)'
                              : 'rgba(124, 58, 237, 0.05)',
                            border: isSelected ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(124, 58, 237, 0.1)',
                            color: isSelected ? '#A78BFA' : 'rgba(255, 255, 255, 0.6)',
                          }}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {!loading && searchResults.length === 0 && searchTerm && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
              >
                <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="body1">
                  No patents found. Try a different search term.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, render as a standalone component
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
        border: '1px solid rgba(124, 58, 237, 0.1)',
        borderRadius: 3,
        mb: 4
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h5"
          fontWeight={600}
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Search & Import Patents
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Search patents from Lens.org database and import them to your portfolio
        </Typography>
      </Box>
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search patents by title, technology, inventor, or assignee..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(124, 58, 237, 0.05)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  borderRadius: 2,
                  color: 'white',
                  '&:hover': {
                    border: '1px solid rgba(124, 58, 237, 0.4)',
                  },
                  '&.Mui-focused': {
                    background: 'rgba(124, 58, 237, 0.08)',
                    border: '1px solid rgba(124, 58, 237, 0.6)',
                    boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#A78BFA',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.4)',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                px: 3,
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                },
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Box>
        </Box>

        {searchResults.length > 0 && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Found {searchResults.length} patent(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedPatents.size === searchResults.length && searchResults.length > 0}
                    indeterminate={selectedPatents.size > 0 && selectedPatents.size < searchResults.length}
                    onChange={handleSelectAll}
                    sx={{
                      color: '#A78BFA',
                      '&.Mui-checked': {
                        color: '#7C3AED',
                      },
                    }}
                  />
                }
                label="Select All"
                sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
              />
              <Button
                variant="contained"
                onClick={handleImportSelected}
                disabled={selectedPatents.size === 0 || importing}
                startIcon={importing ? <CircularProgress size={20} /> : <AddIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
                  },
                }}
              >
                {importing ? 'Importing...' : `Import ${selectedPatents.size} Selected`}
              </Button>
            </Box>
          </Box>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress sx={{ color: '#7C3AED' }} />
          </Box>
        )}

        <Grid container spacing={3}>
          {searchResults.map((patent, index) => {
            const biblio = patent.biblio || {};
            const isSelected = selectedPatents.has(patent.lens_id);

            return (
              <Grid item xs={12} md={6} key={patent.lens_id || index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
                    border: isSelected ? '2px solid #7C3AED' : '1px solid rgba(124, 58, 237, 0.1)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(124, 58, 237, 0.15)',
                      borderColor: 'rgba(124, 58, 237, 0.3)',
                    },
                  }}
                  onClick={() => handleSelectPatent(patent)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPatent(patent);
                        }}
                        sx={{
                          color: '#A78BFA',
                          '&.Mui-checked': {
                            color: '#7C3AED',
                          },
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          fontWeight={600}
                          sx={{
                            color: 'white',
                            fontSize: '1rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {biblio.title?.text || biblio.title || 'Untitled Patent'}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      {patent.jurisdiction && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PublicIcon sx={{ fontSize: 16, color: '#A78BFA' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {patent.jurisdiction}
                          </Typography>
                        </Box>
                      )}

                      {biblio.date_published && (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Published: {new Date(biblio.date_published).toLocaleDateString()}
                        </Typography>
                      )}

                      {patent.doc_number && (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Doc #: {patent.doc_number}
                        </Typography>
                      )}
                    </Box>

                    {biblio.abstract && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {biblio.abstract.text || biblio.abstract}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, borderTop: '1px solid rgba(124, 58, 237, 0.1)' }}>
                    <Chip
                      label={isSelected ? 'Selected' : 'Click to select'}
                      size="small"
                      color={isSelected ? 'primary' : 'default'}
                      sx={{
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)'
                          : 'rgba(124, 58, 237, 0.05)',
                        border: isSelected ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid rgba(124, 58, 237, 0.1)',
                        color: isSelected ? '#A78BFA' : 'rgba(255, 255, 255, 0.6)',
                      }}
                    />
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {!loading && searchResults.length === 0 && searchTerm && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
            sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">
              No patents found. Try a different search term.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default PatentSearch;