import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ListItemButton } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ChecklistIcon from '@mui/icons-material/Checklist';
import { NavLink } from 'react-router-dom';

const drawerWidth = 220;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#fff',
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
        <List>
          <ListItem>
            <ListItemText primary="Cadastros" sx={{ fontWeight: 600 }} />
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/alunos">
              <ListItemIcon><SchoolIcon /></ListItemIcon>
              <ListItemText primary="Aluno" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/professores">
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Professor" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/turmas">
              <ListItemIcon><GroupIcon /></ListItemIcon>
              <ListItemText primary="Turmas" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/usuarios">
              <ListItemIcon><PeopleAltIcon /></ListItemIcon>
              <ListItemText primary="Usuários" />
            </ListItemButton>
          </ListItem>
          <Divider sx={{ my: 1 }} />
          <ListItem>
            <ListItemText primary="Manutenção" sx={{ fontWeight: 600 }} />
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={NavLink} to="/ocorrencias">
              <ListItemIcon><BuildIcon /></ListItemIcon>
              <ListItemText primary="Ocorrências" />
            </ListItemButton>
          </ListItem>
           <Divider sx={{ my: 1 }} />
           <ListItem>
             <ListItemText primary="Cadastro Escola" sx={{ fontWeight: 600 }} />
           </ListItem>
           <ListItem disablePadding>
             <ListItemButton component={NavLink} to="/frequencia">
               <ListItemIcon><EventNoteIcon /></ListItemIcon>
               <ListItemText primary="Frequência" />
             </ListItemButton>
           </ListItem>
           <ListItem disablePadding>
             <ListItemButton component={NavLink} to="/frequencia-aulas">
               <ListItemIcon><ChecklistIcon /></ListItemIcon>
               <ListItemText primary="Frequência Aulas" />
             </ListItemButton>
           </ListItem>
           <ListItem disablePadding>
             <ListItemButton component={NavLink} to="/ocorrencia-form">
               <ListItemIcon><AssignmentIcon /></ListItemIcon>
               <ListItemText primary="Nova Ocorrência" />
             </ListItemButton>
           </ListItem>
        </List>
      </Drawer>
    );
};

export default Sidebar;
