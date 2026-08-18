import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search as SearchIcon, Add as AddIcon, ImportContacts as ImportIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import publicationService from '../../services/publicationService';

function Publications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [myPublications, setMyPublications] = useState([]);
  const [importDialog, setImportDialog] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState(null);

  useEffect(() => {
    loadMyPublications();
  }, []);

  const loadMyPublications = async () => {
    try {
      setLoading(true);
      const publications = await publicationService.getAllPublications();
      setMyPublications(publications);
    } catch (err) {
      setError('Failed to load your publications');
      console.error('Publications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      setError('');
      const results = await publicationService.searchPublications(searchTerm);
      setSearchResults(results.results || []);
    } catch (err) {
      setError('Failed to search publications');
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImport = async (publication) => {
    try {
      setSelectedPublication(publication);
      setImportDialog(true);
      
      const response = await publicationService.importPublication(publication);
      
      if (response.message.includes('already exists')) {
        setError('This publication is already in your records');
      } else {
        setError('');
        await loadMyPublications();
      }
      
      setImportDialog(false);
      setSelectedPublication(null);
    } catch (err) {
      setError('Failed to import publication');
      setImportDialog(false);
      setSelectedPublication(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderOpenAlexCard = (publication) => (
    <Grid item xs={12} md={6} lg={4} key={publication.id}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(124, 58, 237, 0.15)',
            borderColor: 'rgba(124, 58, 237, 0.3)'
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              noWrap
              sx={{
                color: 'white',
                fontSize: '1rem',
                lineHeight: 1.4
              }}
            >
              {publication.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                label={publication.publication_year || 'N/A'}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#A78BFA',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label={`${publication.cited_by_count || 0} Citations`}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 80 }}>
                Journal:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                {publication.primary_location?.source?.display_name || 
                 publication.best_location?.source?.display_name || 'N/A'}
              </Typography>
            </Box>

            {publication.authors && publication.authors.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 80 }}>
                  Authors:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                  {publication.authors.slice(0, 2).map(a => a.name).join(', ')}
                  {publication.authors.length > 2 && ' et al.'}
                </Typography>
              </Box>
            )}

            {publication.concepts && publication.concepts.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, mb: 0.5, display: 'block' }}>
                  Research Areas:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {publication.concepts.slice(0, 3).map((concept, idx) => (
                    <Chip
                      key={idx}
                      label={concept.name}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(124, 58, 237, 0.3)',
                        color: 'rgba(167, 139, 250, 0.9)',
                        fontSize: '0.7rem',
                        height: 24
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions
          sx={{
            p: 2,
            pt: 0,
            borderTop: '1px solid rgba(124, 58, 237, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <Button
            size="small"
            variant="contained"
            startIcon={<ImportIcon />}
            onClick={() => handleImport(publication)}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              textTransform: 'none',
              px: 2,
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)'
              }
            }}
          >
            Import
          </Button>
          {publication.doi && (
            <Button
              size="small"
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                borderRadius: 2,
                fontWeight: 500,
                textTransform: 'none',
                px: 2,
                color: '#A78BFA',
                '&:hover': {
                  background: 'rgba(124, 58, 237, 0.1)'
                }
              }}
            >
              View DOI
            </Button>
          )}
        </CardActions>
      </Card>
    </Grid>
  );

  const renderMyPublicationCard = (publication) => (
    <Grid item xs={12} md={6} lg={4} key={publication.id}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 0.3)'
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              fontWeight={600}
              noWrap
              sx={{
                color: 'white',
                fontSize: '1rem',
                lineHeight: 1.4
              }}
            >
              {publication.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                label={publication.publication_year || 'N/A'}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34D399',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
              <Chip
                label={`${publication.citation_count || 0} Citations`}
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#FBBF24',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 80 }}>
                Journal:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                {publication.journal || 'N/A'}
              </Typography>
            </Box>

            {publication.research_area && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500, minWidth: 80 }}>
                  Research Area:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>
                  {publication.research_area}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>

        <CardActions
          sx={{
            p: 2,
            pt: 0,
            borderTop: '1px solid rgba(16, 185, 129, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <Chip
            label="Imported"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34D399',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
          Publications
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Search and import publications from OpenAlex global database
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
          border: '1px solid rgba(124, 58, 237, 0.1)',
          borderRadius: 3
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search publications by title, author, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                </InputAdornment>
              ),
              sx: {
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(124, 58, 237, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(124, 58, 237, 0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#7C3AED'
                }
              }
            }}
            sx={{
              '& .MuiInputBase-input': {
                color: 'white'
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searchLoading || !searchTerm.trim()}
            startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)'
              },
              '&:disabled': {
                background: 'rgba(124, 58, 237, 0.3)'
              }
            }}
          >
            Search
          </Button>
        </Box>
      </Paper>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'white', mb: 3 }}>
            OpenAlex Search Results ({searchResults.length})
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map(renderOpenAlexCard)}
          </Grid>
        </Box>
      )}

      <Divider sx={{ my: 4, borderColor: 'rgba(124, 58, 237, 0.2)' }} />

      {/* My Publications */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'white', mb: 3 }}>
          My Imported Publications ({myPublications.length})
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#7C3AED' }} />
          </Box>
        ) : myPublications.length > 0 ? (
          <Grid container spacing={3}>
            {myPublications.map(renderMyPublicationCard)}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
              border: '1px solid rgba(124, 58, 237, 0.1)',
              borderRadius: 3
            }}
          >
            <ImportIcon sx={{ fontSize: 48, color: 'rgba(124, 58, 237, 0.5)', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              No Imported Publications Yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Search and import publications from OpenAlex to build your research profile
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import Publication</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {selectedPublication?.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button onClick={() => handleImport(selectedPublication)} variant="contained">
            Confirm Import
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Publications;