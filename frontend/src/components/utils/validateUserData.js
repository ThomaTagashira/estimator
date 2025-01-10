const validateUserData = (userData) => {
    const { firstName, lastName, phone, zipcode } = userData;
  
    if (!firstName || !lastName) {
      alert('First Name and Last Name are required.');
      return false;
    }
  
    if (zipcode && !/^\d{5}$/.test(zipcode)) {
      alert('Zipcode must be a valid 5-digit number.');
      return false;
    }
  
    if (phone) {
      if (!/^\d+$/.test(phone)) {
        alert('Phone number must contain only digits.');
        return false;
      }
  
      if (phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number.');
        return false;
      }
    }
  
    return true;
  };
  
  export default validateUserData;

