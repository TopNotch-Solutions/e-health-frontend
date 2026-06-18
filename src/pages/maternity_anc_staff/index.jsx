import MaternityStationPage from '../maternity/shared/MaternityStationPage';
import { STATION_CONFIG } from '../maternity/shared/departmentConfig';

export default function MaternityAncStaffPage() {
  return <MaternityStationPage stationConfig={STATION_CONFIG.maternity_anc_staff} />;
}
