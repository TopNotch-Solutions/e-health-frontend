import MaternityStationPage from '../maternity/shared/MaternityStationPage';
import { STATION_CONFIG } from '../maternity/shared/departmentConfig';

export default function MaternityAnwStaffPage() {
  return <MaternityStationPage stationConfig={STATION_CONFIG.maternity_anw_staff} />;
}
