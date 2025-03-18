import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon } from '@mui/icons-material';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function PageBreadcrumbs({ items }: PageBreadcrumbsProps) {
  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link
        component={RouterLink}
        to="/"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
      >
        <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
        Dashboard
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return isLast ? (
          <Typography
            key={item.label}
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {item.icon && <Box sx={{ mr: 0.5, display: 'flex' }}>{item.icon}</Box>}
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.label}
            component={RouterLink}
            to={item.href || '#'}
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            {item.icon && <Box sx={{ mr: 0.5, display: 'flex' }}>{item.icon}</Box>}
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}