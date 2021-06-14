import GnosisExplorerService from '@/services/gnosis/explorer.service';
import GnosisOperatorService from '@/services/gnosis/operator.service';

const gnosisOperator = new GnosisOperatorService();
const gnosisExplorer = new GnosisExplorerService();

export default function useGnosisProtocol() {
  return {
    gnosisOperator,
    gnosisExplorer
  };
}
