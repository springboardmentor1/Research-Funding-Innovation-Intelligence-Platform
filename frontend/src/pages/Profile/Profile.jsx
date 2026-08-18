import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    research_domain: '',
    keywords: '',
    technology_area: '',
    biography: '',
    experience_years: 0,
    publication_count: 0,
    patent_count: 0
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        research_domain: data.research_domain || '',
        keywords: data.keywords || '',
        technology_area: data.technology_area || '',
        biography: data.biography || '',
        experience_years: data.experience_years || 0,
        publication_count: data.publication_count || 0,
        patent_count: data.patent_count || 0
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
        setIsEditing(true);
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await profileService.createProfile(formData);
      setSuccess('Profile created successfully!');
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await profileService.updateProfile(formData);
      setSuccess('Profile updated successfully!');
      await loadProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your profile?')) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await profileService.deleteProfile();
      setSuccess('Profile deleted successfully!');
      setProfile(null);
      setIsEditing(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Research Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your research profile and expertise areas
          </Typography>
        </Box>

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
          <Typography variant="h6" gutterBottom>
            User Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={user?.full_name || ''}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user?.email || ''}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Role"
                value={user?.role || ''}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization"
                value={user?.organization || ''}
                disabled
                margin="normal"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Research Information
          </Typography>
          {profile && !isEditing && (
            <Box>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(true)}
                sx={{ mr: 2 }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
              >
                Delete Profile
              </Button>
            </Box>
          )}
        </Box>

        {(!profile || isEditing) && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Domain"
                name="research_domain"
                value={formData.research_domain}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Your primary field of research"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Comma-separated research keywords"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technology Area"
                name="technology_area"
                value={formData.technology_area}
                onChange={handleChange}
                margin="normal"
                helperText="Specific technology areas of expertise"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Biography"
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                helperText="Professional biography and research summary"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Experience (Years)"
                name="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Publication Count"
                name="publication_count"
                type="number"
                value={formData.publication_count}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Patent Count"
                name="patent_count"
                type="number"
                value={formData.patent_count}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={profile ? handleUpdate : handleCreate}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={24} /> : profile ? 'Update Profile' : 'Create Profile'}
                </Button>
                {profile && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        )}

        {profile && !isEditing && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Domain"
                value={profile.research_domain}
                disabled
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Keywords"
                value={profile.keywords}
                disabled
                margin="normal"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Technology Area"
                value={profile.technology_area}
                disabled
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Biography"
                value={profile.biography}
                disabled
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Experience (Years)"
                type="number"
                value={profile.experience_years}
                disabled
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Publication Count"
                type="number"
                value={profile.publication_count}
                disabled
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Patent Count"
                type="number"
                value={profile.patent_count}
                disabled
                margin="normal"
              />
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}

export default Profile;