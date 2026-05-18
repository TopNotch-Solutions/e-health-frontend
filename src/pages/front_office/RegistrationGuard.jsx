import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGISTRATION_ALLOWED_KEY } from './patientUtils';

export default function RegistrationGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(REGISTRATION_ALLOWED_KEY) !== '1') {
      navigate('/front_office', { replace: true });
    }
  }, [navigate]);

  if (sessionStorage.getItem(REGISTRATION_ALLOWED_KEY) !== '1') {
    return null;
  }

  return children;
}
