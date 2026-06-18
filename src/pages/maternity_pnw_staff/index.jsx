import MaternityStationPage from '../maternity/shared/MaternityStationPage';
import { STATION_CONFIG } from '../maternity/shared/departmentConfig';

export default function MaternityPnwStaffPage() {
  return <MaternityStationPage stationConfig={STATION_CONFIG.maternity_pnw_staff} />;
}
