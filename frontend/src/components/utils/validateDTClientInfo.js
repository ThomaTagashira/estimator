// This is temporary, merge with vaidateClientInfo in future once DynamicTablePage and Hook are cleaned up.

const validateDTClientInfo = (updatedClientInfo) => {
    const { client_phone: clientPhone, client_email: clientEmail } = updatedClientInfo;
  
    if (clientPhone) {
      if (!/^\d+$/.test(clientPhone)) {
        alert('Client phone must contain only digits.');
        return false;
      }
  
      if (clientPhone.length !== 10) {
        alert('Please enter a valid 10-digit client phone number.');
        return false;
      }
    }
  
    if (clientEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail)) {
        alert('Please enter a valid client email address.');
        return false;
      }
    }
  
    return true;
  };
  
export default validateDTClientInfo;
