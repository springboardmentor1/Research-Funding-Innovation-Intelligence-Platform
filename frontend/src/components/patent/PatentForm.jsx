import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Add as AddIcon
} from '@mui/icons-material';
import patentService from '../../services/patentService';

// Dark SaaS styling constants
const darkSurface = '#111118';
const inputBackground = '#15151F';
const inputBorder = 'rgba(255, 255, 255, 0.08)';
const inputBorderHover = 'rgba(255, 255, 255, 0.12)';
const purpleAccent = '#7C3AED';
const purpleAccentHover = '#8B5CF6';
const textPrimary = '#FFFFFF';
const textSecondary = 'rgba(255, 255, 255, 0.6)';
const textMuted = 'rgba(255, 255, 255, 0.4)';
const dividerColor = 'rgba(255, 255, 255, 0.06)';

const fieldStyles = {
  root: {
    backgroundColor: inputBackground,
    border: `1px solid ${inputBorder}`,
    borderRadius: '8px',
    transition: 'all 0.18s ease',
    '&:hover': {
      borderColor: inputBorderHover,
      backgroundColor: '#1A1A28',
    },
    '&.Mui-focused': {
      borderColor: purpleAccent,
      backgroundColor: '#1A1A28',
      boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
    },
  },
  label: {
    color: textSecondary,
    fontSize: '0.875rem',
    fontWeight: 500,
    '&.Mui-focused': {
      color: purpleAccent,
    },
  },
  input: {
    color: textPrimary,
    fontSize: '0.95rem',
    '&::placeholder': {
      color: textMuted,
    },
  },
};

const sectionHeaderStyles = {
  color: textMuted,
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  mb: 2.5,
  mt: 1,
};

const dialogPaperStyles = {
  background: darkSurface,
  border: `1px solid ${inputBorder}`,
  borderRadius: '16px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
};

const headerStyles = {
  pb: 3,
  borderBottom: `1px solid ${dividerColor}`,
};

const iconBoxStyles = {
  width: 40,
  height: 40,
  borderRadius: '10px',
  background: `linear-gradient(135deg, ${purpleAccent} 0%, #5B21B6 100%)`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const titleStyles = {
  color: textPrimary,
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.4,
};

const subtitleStyles = {
  color: textSecondary,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  mt: 0.5,
};

const alertStyles = {
  mb: 3,
  borderRadius: '8px',
  fontSize: '0.875rem',
};

const errorAlertStyles = {
  ...alertStyles,
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#FCA5A5',
  '& .MuiAlert-icon': {
    color: '#EF4444',
  },
};

const successAlertStyles = {
  ...alertStyles,
  backgroundColor: 'rgba(16, 185, 129, 0.08)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  color: '#34D399',
  '& .MuiAlert-icon': {
    color: '#10B981',
  },
};

const cancelButtonStyles = {
  borderRadius: '8px',
  fontWeight: 500,
  textTransform: 'none',
  px: 3,
  py: 1.25,
  fontSize: '0.875rem',
  borderColor: inputBorder,
  color: textSecondary,
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: inputBorderHover,
    color: textPrimary,
  },
};

const submitButtonStyles = {
  borderRadius: '8px',
  fontWeight: 500,
  textTransform: 'none',
  px: 3,
  py: 1.25,
  fontSize: '0.875rem',
  backgroundColor: purpleAccent,
  color: 'white',
  '&:hover': {
    backgroundColor: purpleAccentHover,
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
};

const paperStyles = {
  p: 4,
  background: darkSurface,
  border: `1px solid ${inputBorder}`,
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  mb: 4,
};

const PatentForm = ({ onPatentAdded, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    inventors: '',
    assignee: '',
    filing_date: '',
    publication_date: '',
    technology_area: '',
    country: '',
    status: 'Pending'
  });

  const handleChangeRef = useRef((e) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      [e.target.name]: e.target.value
    }));
  });

  const handleChange = handleChangeRef.current;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const patentData = {
        ...formData,
        filing_date: formData.filing_date || null,
        publication_date: formData.publication_date || null
      };

      await patentService.createPatent(patentData);
      setSuccess('Patent added successfully!');
      
      // Reset form
      setFormData({
        title: '',
        abstract: '',
        inventors: '',
        assignee: '',
        filing_date: '',
        publication_date: '',
        technology_area: '',
        country: '',
        status: 'Pending'
      });

      // Notify parent component
      if (onPatentAdded) {
        onPatentAdded();
      }

      // Close dialog if provided
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add patent');
    } finally {
      setLoading(false);
    }
  };

  // If onClose is provided, render as a Dialog
  if (onClose) {
    return (
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={false}
        PaperProps={{
          sx: dialogPaperStyles
        }}
      >
        <DialogTitle sx={headerStyles}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box sx={iconBoxStyles}>
              <AddIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={titleStyles}>
                Add New Patent
              </Typography>
              <Typography sx={subtitleStyles}>
                Add patent details to your research portfolio
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert 
                severity="error" 
                sx={errorAlertStyles}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert 
                severity="success" 
                sx={successAlertStyles}
              >
                {success}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Section 1 — Basic Information */}
              <Box>
                <Typography sx={sectionHeaderStyles}>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2.5, borderColor: dividerColor }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Patent Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter the official patent title"
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Provide a brief description of the patent"
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                    }}
                  />
                </Box>
              </Box>

              {/* Section 2 — Ownership & Classification */}
              <Box>
                <Typography sx={sectionHeaderStyles}>
                  Ownership & Classification
                </Typography>
                <Divider sx={{ mb: 2.5, borderColor: dividerColor }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Inventors"
                    name="inventors"
                    value={formData.inventors}
                    onChange={handleChange}
                    placeholder="e.g., Dr. John Smith"
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Assignee"
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleChange}
                    placeholder="e.g., University, Company"
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Technology Area"
                    name="technology_area"
                    value={formData.technology_area}
                    onChange={handleChange}
                    placeholder="e.g., Medical AI, ML"
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="e.g., US, UK, JP"
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                    }}
                  />
                </Box>
              </Box>

              {/* Section 3 — Dates & Status */}
              <Box>
                <Typography sx={sectionHeaderStyles}>
                  Dates & Status
                </Typography>
                <Divider sx={{ mb: 2.5, borderColor: dividerColor }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography sx={{ ...fieldStyles.label, mb: 1, display: 'block' }}>
                        Filing Date
                      </Typography>
                      <TextField
                        fullWidth
                        name="filing_date"
                        type="date"
                        value={formData.filing_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: false }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            ...fieldStyles.root,
                            '& input': {
                              ...fieldStyles.input,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            display: 'none',
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ ...fieldStyles.label, mb: 1, display: 'block' }}>
                        Publication Date
                      </Typography>
                      <TextField
                        fullWidth
                        name="publication_date"
                        type="date"
                        value={formData.publication_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: false }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            ...fieldStyles.root,
                            '& input': {
                              ...fieldStyles.input,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            display: 'none',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': fieldStyles.root,
                      '& .MuiInputLabel-root': fieldStyles.label,
                      '& .MuiInputBase-input': fieldStyles.input,
                      '& .MuiSelect-select': {
                        color: textPrimary,
                      },
                    }}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Granted">Granted</MenuItem>
                    <MenuItem value="Published">Published</MenuItem>
                    <MenuItem value="Abandoned">Abandoned</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                  </TextField>
                </Box>
              </Box>
            </Box>

            {/* Footer Actions */}
            <Divider sx={{ mt: 4, mb: 3, borderColor: dividerColor }} />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2
            }}>
              {onClose && (
                <Button
                  variant="outlined"
                  onClick={onClose}
                  disabled={loading}
                  sx={cancelButtonStyles}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} /> : <AddIcon />}
                disabled={loading}
                sx={submitButtonStyles}
              >
                {loading ? 'Adding...' : 'Add Patent'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise, render as a standalone component
  return (
    <Paper
      elevation={0}
      sx={paperStyles}
    >
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Box sx={iconBoxStyles}>
          <AddIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            fontWeight={600}
            gutterBottom
            sx={titleStyles}
          >
            Add New Patent
          </Typography>
          <Typography variant="body2" sx={subtitleStyles}>
            Add patent details to your research portfolio
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 3, borderColor: dividerColor }} />
      <Box component="form" onSubmit={handleSubmit}>
        {error && (
          <Alert 
            severity="error" 
            sx={errorAlertStyles}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={successAlertStyles}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Section 1 — Basic Information */}
          <Box>
            <Typography sx={sectionHeaderStyles}>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: dividerColor }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Patent Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter the official patent title"
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                }}
              />
              <TextField
                fullWidth
                label="Abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Provide a brief description of the patent"
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                }}
              />
            </Box>
          </Box>

          {/* Section 2 — Ownership & Classification */}
          <Box>
            <Typography sx={sectionHeaderStyles}>
              Ownership & Classification
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: dividerColor }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Inventors"
                name="inventors"
                value={formData.inventors}
                onChange={handleChange}
                placeholder="e.g., Dr. John Smith"
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                }}
              />
              <TextField
                fullWidth
                label="Assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
                placeholder="e.g., University, Company"
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                }}
              />
              <TextField
                fullWidth
                label="Technology Area"
                name="technology_area"
                value={formData.technology_area}
                onChange={handleChange}
                placeholder="e.g., Medical AI, ML"
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                }}
              />
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., US, UK, JP"
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                }}
              />
            </Box>
          </Box>

          {/* Section 3 — Dates & Status */}
          <Box>
            <Typography sx={sectionHeaderStyles}>
              Dates & Status
            </Typography>
            <Divider sx={{ mb: 2.5, borderColor: dividerColor }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography sx={{ ...fieldStyles.label, mb: 1, display: 'block' }}>
                    Filing Date
                  </Typography>
                  <TextField
                    fullWidth
                    name="filing_date"
                    type="date"
                    value={formData.filing_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: false }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyles.root,
                        '& input': {
                          ...fieldStyles.input,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        display: 'none',
                      },
                    }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ ...fieldStyles.label, mb: 1, display: 'block' }}>
                    Publication Date
                  </Typography>
                  <TextField
                    fullWidth
                    name="publication_date"
                    type="date"
                    value={formData.publication_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: false }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        ...fieldStyles.root,
                        '& input': {
                          ...fieldStyles.input,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        display: 'none',
                      },
                    }}
                  />
                </Box>
              </Box>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': fieldStyles.root,
                  '& .MuiInputLabel-root': fieldStyles.label,
                  '& .MuiInputBase-input': fieldStyles.input,
                  '& .MuiSelect-select': {
                    color: textPrimary,
                  },
                }}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Granted">Granted</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Abandoned">Abandoned</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </TextField>
            </Box>
          </Box>
        </Box>

        {/* Footer Actions */}
        <Divider sx={{ mt: 4, mb: 3, borderColor: dividerColor }} />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: 2
        }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} /> : <AddIcon />}
            disabled={loading}
            sx={submitButtonStyles}
          >
            {loading ? 'Adding...' : 'Add Patent'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PatentForm;