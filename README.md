build os : electron

import { useNodeConfig, useNodeChoice } from '~/common/stores/nodeChoice.store';

const nodeChoice = useNodeChoice();
const { url, key } = useNodeConfig();

import { nodeChoiceActions } from '~/common/stores/nodeChoice.store';
const config = nodeChoiceActions.getState().config;

import { useNodeChoice } from '~/common/stores/nodeChoice.store';
const nodeChoice = useNodeChoice(); // 'my' | 'global' | 'unset'

import { nodeChoiceActions } from '~/common/stores/nodeChoice.store';
nodeChoiceActions.set('global');
