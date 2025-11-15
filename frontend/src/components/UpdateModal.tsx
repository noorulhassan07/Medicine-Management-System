import React, { useState, useEffect } from "react";

interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  dateOfEntry: string;
  price: number;
}

interface UpdateModalProps {
  medicine: Medicine;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedData: Partial<Medicine>) => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ medicine, isOpen, onClose, onUpdate }) => {
  const [updates, setUpdates] = useState({
    updateName: false,
    updateQuantity: false,
    updatePrice: false,
    updateManufacturing: false,
    updateExpiry: false,
  });

  const [formData, setFormData] = useState({
    name: medicine.name,
    quantity: medicine.quantity,
    price: medicine.price,
    manufacturingDate: medicine.manufacturingDate,
    expiryDate: medicine.expiryDate,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: medicine.name,
        quantity: medicine.quantity,
        price: medicine.price,
        manufacturingDate: medicine.manufacturingDate,
        expiryDate: medicine.expiryDate,
      });
      setUpdates({
        updateName: false,
        updateQuantity: false,
        updatePrice: false,
        updateManufacturing: false,
        updateExpiry: false,
      });
    }
  }, [isOpen, medicine]);

  const handleUpdateToggle = (field: keyof typeof updates) => {
    setUpdates(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData: Partial<Medicine> = {
      dateOfEntry: new Date().toISOString().split('T')[0] // Always update entry date
    };

    // Only include fields that are marked for update
    if (updates.updateName) updatedData.name = formData.name;
    if (updates.updateQuantity) updatedData.quantity = Number(formData.quantity);
    if (updates.updatePrice) updatedData.price = Number(formData.price);
    if (updates.updateManufacturing) updatedData.manufacturingDate = formData.manufacturingDate;
    if (updates.updateExpiry) updatedData.expiryDate = formData.expiryDate;

    onUpdate(updatedData);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#007BFF' }}>
          ✏️ Update {medicine.name}
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Name Update */}
          <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Update Name?</label>
              <button
                type="button"
                onClick={() => handleUpdateToggle('updateName')}
                style={{
                  backgroundColor: updates.updateName ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {updates.updateName ? 'Yes' : 'No'}
              </button>
            </div>
            {updates.updateName && (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter new name"
              />
            )}
          </div>

          {/* Quantity Update */}
          <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Update Quantity?</label>
              <button
                type="button"
                onClick={() => handleUpdateToggle('updateQuantity')}
                style={{
                  backgroundColor: updates.updateQuantity ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {updates.updateQuantity ? 'Yes' : 'No'}
              </button>
            </div>
            {updates.updateQuantity && (
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                min="0"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter new quantity"
              />
            )}
          </div>

          {/* Price Update */}
          <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Update Price?</label>
              <button
                type="button"
                onClick={() => handleUpdateToggle('updatePrice')}
                style={{
                  backgroundColor: updates.updatePrice ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {updates.updatePrice ? 'Yes' : 'No'}
              </button>
            </div>
            {updates.updatePrice && (
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter new price"
              />
            )}
          </div>

          {/* Manufacturing Date Update */}
          <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Update Manufacturing Date?</label>
              <button
                type="button"
                onClick={() => handleUpdateToggle('updateManufacturing')}
                style={{
                  backgroundColor: updates.updateManufacturing ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {updates.updateManufacturing ? 'Yes' : 'No'}
              </button>
            </div>
            {updates.updateManufacturing && (
              <input
                type="date"
                value={formData.manufacturingDate}
                onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            )}
          </div>

          {/* Expiry Date Update */}
          <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 'bold' }}>Update Expiry Date?</label>
              <button
                type="button"
                onClick={() => handleUpdateToggle('updateExpiry')}
                style={{
                  backgroundColor: updates.updateExpiry ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {updates.updateExpiry ? 'Yes' : 'No'}
              </button>
            </div>
            {updates.updateExpiry && (
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            )}
          </div>

          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '15px',
            fontSize: '12px',
            color: '#0066cc'
          }}>
            📅 <strong>Note:</strong> Entry date will be automatically updated to today's date.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Update Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateModal;
