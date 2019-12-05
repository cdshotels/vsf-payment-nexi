import { Module } from 'vuex';
import { NexiState } from '../types/NexiState';
import { getters } from './getters';
import { actions } from './actions';

export const module: Module<NexiState, any> = {
  namespaced: true,
  actions,
  getters
};
