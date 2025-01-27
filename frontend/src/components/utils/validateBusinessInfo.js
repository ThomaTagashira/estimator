const validateBusinessInfo = (businessInfo) => {
    const { businessPhone, businessEmail } = businessInfo;
  
    if (businessPhone) {
      if (!/^\d+$/.test(businessPhone)) {
        alert('Business phone must contain only digits.');
        return false;
      }
  
      if (businessPhone.length !== 10) {
        alert('Please enter a valid 10-digit business phone number.');
        return false;
      }
    }
  
    if (businessEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(businessEmail)) {
        alert('Please enter a valid business email address.');
        return false;
      }
    }
  
    return true;
  };
  
export default validateBusinessInfo;
