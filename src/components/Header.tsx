import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import { useAuth } from '../AuthContext';

interface HeaderProps {
  userName: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onMenuClick }) => {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'var(--accent) !important', backgroundColor: '#0072C3 !important', color: 'white', zIndex: 1201, borderRadius: '0 !important' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={onMenuClick} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={600} fontFamily="Schibsted Grotesk">
            ERP - Figueiredo Ferraz
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mr: 1 }}>{userName}</Typography>
          <IconButton
            color="inherit"
            onClick={handleMenu}
            sx={{
              p: 0.3,
              borderRadius: 999,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.12)' },
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.96)',
                color: '#0b6db5',
                width: 29,
                height: 29,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.55) inset',
              }}
            >
              <PersonOutlineRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>{userName}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
