// How to access stored node configuration values

import { 
  useNodeChoice, 
  useNodeConfig, 
  useIsNodeConfigured,
  nodeChoiceActions 
} from '~/common/stores/nodeChoice.store';

// 1. Using hooks in React components
function MyComponent() {
  // Get the current node choice ('unset' | 'own' | 'global')
  const nodeChoice = useNodeChoice();
  
  // Get the node configuration (contains PeerID)
  const nodeConfig = useNodeConfig();
  
  // Check if node is fully configured
  const isConfigured = useIsNodeConfigured();

  // Access the PeerID
  const peerID = nodeConfig.key;

  return (
    <div>
      <p>Node Type: {nodeChoice}</p>
      <p>PeerID: {peerID || 'Not set'}</p>
      <p>Is Configured: {isConfigured ? 'Yes' : 'No'}</p>
      
      {nodeChoice === 'own' && <p>Using Local Model</p>}
      {nodeChoice === 'global' && <p>Using Global Network</p>}
    </div>
  );
}

// 2. Using actions outside React components
function someUtilityFunction() {
  // Get current values directly from store
  const currentChoice = nodeChoiceActions.isConfigured();
  
  // Access the store state directly
  const storeState = useNodeChoiceStore.getState();
  const nodeChoice = storeState.choice; // 'own' | 'global' | 'unset'
  const peerID = storeState.config.key;
  
  console.log('Node Choice:', nodeChoice);
  console.log('PeerID:', peerID);
}

// 3. Conditional logic based on node type
function handleAPICall() {
  const nodeChoice = useNodeChoice();
  const nodeConfig = useNodeConfig();
  
  if (nodeChoice === 'own') {
    // Local Model logic
    console.log('Connecting to local node with PeerID:', nodeConfig.key);
    // Make API call to local node
  } else if (nodeChoice === 'global') {
    // Global Network logic
    console.log('Connecting to global network with PeerID:', nodeConfig.key);
    // Make API call to global network
  }
}

// 4. Update values programmatically
function updateNodeSettings() {
  // Change node type
  nodeChoiceActions.set('own'); // or 'global'
  
  // Update PeerID
  nodeChoiceActions.setConfig({ key: 'new-peer-id-here' });
  
  // Reset everything
  nodeChoiceActions.reset();
}

// 5. Listen to store changes (outside React)
import { useNodeChoiceStore } from '~/common/stores/nodeChoice.store';

function subscribeToChanges() {
  const unsubscribe = useNodeChoiceStore.subscribe(
    (state) => {
      console.log('Store updated:', {
        choice: state.choice,
        peerID: state.config.key,
        isConfigured: state.isConfigured()
      });
    }
  );
  
  // Don't forget to unsubscribe when done
  return unsubscribe;
}

// 6. Type-safe access patterns
type NodeChoice = 'unset' | 'own' | 'global';

function getNodeDisplayName(choice: NodeChoice): string {
  switch (choice) {
    case 'own':
      return 'Local Model';
    case 'global':
      return 'Global Network';
    case 'unset':
      return 'Not Configured';
    default:
      return 'Unknown';
  }
}

// 7. Validation helpers
function validateNodeConfiguration() {
  const nodeChoice = useNodeChoice();
  const nodeConfig = useNodeConfig();
  
  const hasChoice = nodeChoice !== 'unset';
  const hasPeerID = !!nodeConfig.key?.trim();
  
  return {
    isValid: hasChoice && hasPeerID,
    errors: {
      noChoice: !hasChoice,
      noPeerID: !hasPeerID
    }
  };
}