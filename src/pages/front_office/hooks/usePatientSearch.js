import { useState } from 'react';
import { handleSessionExpired } from '../../../api/authSession';
import { searchPatients } from '../../../api/patients';
import { useToast } from '../context/ToastContext';
import { validateDobSearch, validateNationalId } from '../utils/validation';

/**
 * Patient search state and API logic (validation surfaces via toast).
 */
export function usePatientSearch({ onNavigateLogin }) {
  const { showToast } = useToast();
  const [searchMode, setSearchMode] = useState('id');
  const [phase, setPhase] = useState('find');
  const [nationalId, setNationalId] = useState('');
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  function resetSearch() {
    setPhase('find');
    setResults([]);
    setNationalId('');
    setDob('');
    setName('');
  }

  function validateSearchForm() {
    if (searchMode === 'id') {
      return validateNationalId(nationalId);
    }
    return validateDobSearch({ dob, name });
  }

  async function runSearch(e) {
    e?.preventDefault?.();
    const validationError = validateSearchForm();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    setLoading(true);
    const params =
      searchMode === 'id'
        ? { id_number: nationalId.trim() }
        : { date_of_birth: dob, name: name.trim() };

    try {
      const data = await searchPatients(params);
      const list = data.patients || [];
      setResults(list);
      setPhase(list.length === 1 && list[0].profile_complete ? 'returning' : 'results');
    } catch (err) {
      if (err.requiresLogin) {
        handleSessionExpired();
        onNavigateLogin?.();
        return;
      }
      showToast(err.message || 'Search failed. Ensure you are signed in and the API is running.', 'error');
      setResults([]);
      setPhase('find');
    } finally {
      setLoading(false);
    }
  }

  return {
    searchMode,
    setSearchMode,
    phase,
    setPhase,
    nationalId,
    setNationalId,
    dob,
    setDob,
    name,
    setName,
    results,
    loading,
    resetSearch,
    runSearch,
  };
}
