'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { geocodeAddress } from '@/lib/services/mapbox';
import { debounce } from 'lodash';

interface AddressInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (address: string, coordinates?: { latitude: number; longitude: number }) => void;
  onGeocodeResult?: (result: {
    latitude: number;
    longitude: number;
    formattedAddress?: string;
    suburb?: string;
    postcode?: string;
  } | null) => void;
  disabled?: boolean;
  className?: string;
}

const AddressInput: React.FC<AddressInputProps> = ({
  label = "Address",
  placeholder = "Enter business address...",
  value = "",
  onChange,
  onGeocodeResult,
  disabled = false,
  className = "",
}) => {
  const [address, setAddress] = useState(value);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Debounced geocoding function
  const debouncedGeocode = useCallback(
    debounce(async (addressText: string) => {
      if (!addressText.trim() || addressText.length < 10) {
        setGeocodeStatus('idle');
        return;
      }

      setIsGeocoding(true);
      setGeocodeStatus('idle');

      try {
        const result = await geocodeAddress(addressText);
        
        if (result) {
          setGeocodeStatus('success');
          if (onChange) {
            onChange(addressText, { 
              latitude: result.latitude, 
              longitude: result.longitude 
            });
          }
          if (onGeocodeResult) {
            onGeocodeResult(result);
          }
        } else {
          setGeocodeStatus('error');
          if (onGeocodeResult) {
            onGeocodeResult(null);
          }
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setGeocodeStatus('error');
        if (onGeocodeResult) {
          onGeocodeResult(null);
        }
      } finally {
        setIsGeocoding(false);
      }
    }, 800), // 800ms debounce
    [onChange, onGeocodeResult]
  );

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Trigger basic onChange immediately
    if (onChange) {
      onChange(newAddress);
    }

    // Trigger debounced geocoding
    if (newAddress.trim()) {
      debouncedGeocode(newAddress);
    } else {
      setGeocodeStatus('idle');
      if (onGeocodeResult) {
        onGeocodeResult(null);
      }
    }
  };

  // Update local state when value prop changes
  useEffect(() => {
    setAddress(value);
  }, [value]);

  const getStatusIcon = () => {
    if (isGeocoding) {
      return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    if (geocodeStatus === 'success') {
      return <MapPin className="w-4 h-4 text-green-500" />;
    }
    if (geocodeStatus === 'error') {
      return <MapPin className="w-4 h-4 text-red-500" />;
    }
    return <MapPin className="w-4 h-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isGeocoding) {
      return "Finding location...";
    }
    if (geocodeStatus === 'success') {
      return "Location found";
    }
    if (geocodeStatus === 'error') {
      return "Location not found - please check address";
    }
    return "";
  };

  return (
    <div className={className}>
      <Label htmlFor="address-input" className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative mt-1">
        <Input
          id="address-input"
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            pr-10
            ${geocodeStatus === 'success' ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}
            ${geocodeStatus === 'error' ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
          `}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {getStatusIcon()}
        </div>
      </div>
      
      {/* Status message */}
      {getStatusText() && (
        <p className={`
          text-xs mt-1 
          ${geocodeStatus === 'success' ? 'text-green-600' : ''}
          ${geocodeStatus === 'error' ? 'text-red-600' : ''}
          ${isGeocoding ? 'text-blue-600' : ''}
        `}>
          {getStatusText()}
        </p>
      )}
    </div>
  );
};

export default AddressInput;