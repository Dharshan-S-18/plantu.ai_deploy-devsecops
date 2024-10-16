import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, FormControl, InputLabel, IconButton, Button, Typography, TextField, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers';

const fieldOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Description', value: 'description' },
  { label: 'Status', value: 'status' },
];

const operatorOptions = [
  { label: 'Is', value: 'is' },
  { label: 'Is Not', value: 'isNot' },
  { label: 'Contains', value: 'contains' },
  { label: 'Does Not Contain', value: 'doesNotContain' },
];

const valueOptions = {
  status: ['To Do', 'In Progress', 'Blocked', 'Completed'],
};

const DynamicFilter = ({ onApply, initialFilters = [] }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [assignees, setAssignees] = useState([]);

  useEffect(() => {
    const fetchAssignees = async () => {
      const accountId = sessionStorage.getItem('accountId');
      if (!accountId) {
        console.error('No accountId found in sessionStorage');
        return;
      }
      try {
        const response = await fetch(`/api/auth/getAgents?accountId=${accountId}`); // Replace with your API URL
        const data = await response.json();
        setAssignees(data); // Assuming the response is an array of assignee names
      } catch (error) {
        console.error('Error fetching assignees:', error);
      }
    };

    fetchAssignees();
  }, []);

  // Update filters when initialFilters change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleAddCondition = () => {
    setFilters([...filters, { field: '', operator: '', value: '' }]);
  };

  const handleRemoveCondition = (index) => {
    const newFilters = filters.filter((_, idx) => idx !== index);
    setFilters(newFilters);
  };

  const handleConditionChange = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const activeFilterCount = filters.filter(f => f.field && f.value).length;
    onApply(filters, activeFilterCount); // Pass the count along with filters
  };

  const renderValueField = (field, index) => {
    if (field === 'name' || field === 'description') {
      return (
        <TextField
          label="Value"
          variant="outlined"
          size="small"
          value={filters[index].value}
          onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
          sx={{ minWidth: 150 }}
        />
      );
    } else if (field === 'status') {
      return (
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Value</InputLabel>
          <Select
            value={filters[index].value}
            onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
            label="Value"
            size="small"
          >
            {(valueOptions[field] || []).map((value) => (
              <MenuItem key={value} value={value}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Active Filters</Typography>
      {/* Display current filters as chips */}
      <Box sx={{ mb: 2 }}>
        {filters.filter(f => f.field && f.value).map((filter, index) => (
          <Chip
            key={index}
            label={`${filter.field}: ${filter.value}`}
            onDelete={() => handleRemoveCondition(index)}
            sx={{ mr: 1, mb: 1 }}
          />
        ))}
      </Box>
      
      <Typography variant="h6">Add Filter Conditions</Typography>
      {filters.map((filter, index) => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }} key={index}>
          <FormControl sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel>Field</InputLabel>
            <Select
              value={filter.field}
              onChange={(e) => handleConditionChange(index, 'field', e.target.value)}
              label="Field"
              size="small"
            >
              {fieldOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel>Operator</InputLabel>
            <Select
              value={filter.operator}
              onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
              label="Operator"
              disabled={!filter.field}
              size="small"
            >
              {operatorOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {renderValueField(filter.field, index)}
          <IconButton onClick={() => handleRemoveCondition(index)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="contained" onClick={handleAddCondition}>
          <AddIcon /> Add Condition
        </Button>
        <Button variant="contained" color="primary" onClick={applyFilters}>
          Apply Filters
        </Button>
      </Box>
    </Box>
  );
};

export default DynamicFilter;
