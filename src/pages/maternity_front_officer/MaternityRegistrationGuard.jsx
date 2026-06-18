import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MATERNITY_REGISTRATION_ALLOWED_KEY } from './registrationUtils';

export default function MaternityRegistrationGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(MATERNITY_REGISTRATION_ALLOWED_KEY) !== '1') {
      navigate('/maternity_front_officer', { replace: true });
    }
  }, [navigate]);

  if (sessionStorage.getItem(MATERNITY_REGISTRATION_ALLOWED_KEY) !== '1') {
    return null;
  }

  return children;
}
