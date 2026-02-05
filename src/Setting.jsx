import React,{useState} from 'react';
import { DialogTitle, DialogContent, DialogActions, Button, Box, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Setting = ({ setAppBarColor, onClose, setCompany, inflationMode, setInflationMode }) => {
  const { t } = useTranslation();
  const colorCompanyMap = [
    { color: '#009739', company: 'Manulife' },
    { color: '#E4002B', company: 'AIA' },
    { color: '#FFCD00', company: 'Sunlife' },
    { color: '#00008F', company: 'AXA' },
    { color: '#004A9F', company: 'Chubb' },
    { color: '#ed1b2e', company: 'Prudential' },
    { color: '#e67e22', company: 'FWD' },
  ];
 


  return (
    <>
      <DialogTitle>v7.1.1 Backend v6.0.5</DialogTitle>
      <DialogContent>
        {/* Inflation Mode Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 'bold', mb: 1 }}>
              {t('settings.inflationModeLabel')}
            </FormLabel>
            <RadioGroup
              value={inflationMode}
              onChange={(e) => setInflationMode(e.target.value)}
            >
              <FormControlLabel
                value="medicalInflationMode"
                control={<Radio />}
                label={t('settings.medicalInflationMode')}
              />
              <FormControlLabel
                value="normalInflationMode"
                control={<Radio />}
                label={t('settings.normalInflationMode')}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Company Selection */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
         {(whitelisted || !IsProduction  || window.location.hostname.includes('tool')) && colorCompanyMap.map(({ color, company }) => (
            <Button
              key={color}
              onClick={() => {
                setAppBarColor(color);
                setCompany(company);
                onClose();
              }}
              sx={{
                backgroundColor: color,
                color: color === '#FFCD00' ? 'black' : 'white',
                width: '120px',
                margin: '5px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {company}
            </Button>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </>
  );
};

export default Setting;