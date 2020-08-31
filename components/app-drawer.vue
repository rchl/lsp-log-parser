<template>
  <v-navigation-drawer v-model="uiModel.drawerVisible" app fixed>
    <v-list v-if="logModel.selectedFilters.length" dense>
      <v-subheader>Sessions</v-subheader>
      <v-list-item
        v-for="filter in logModel.selectedFilters"
        :key="filter.name"
        link
        @click="filter.enabled = !filter.enabled"
      >
        <v-list-item-content>
          <v-list-item-title>
            {{ filter.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon :color="filter.enabled ? 'primary' : 'grey'">
            {{ filter.enabled ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
          </v-icon>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <v-divider />

    <v-list dense>
      <v-subheader>Filter by category</v-subheader>
      <v-list-item-group v-model="uiModel.selectedCategoryType" color="primary" mandatory>
        <v-list-item v-for="category in uiModel.CATEGORIES" :key="category.type" :value="category.type">
          <v-list-item-content>
            <v-list-item-title>
              {{ category.name }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon :color=" uiModel.selectedCategoryType !== category.type ? 'grey' : ''">
              {{ uiModel.selectedCategoryType === category.type ? 'mdi-radiobox-marked' : 'mdi-radiobox-blank' }}
            </v-icon>
          </v-list-item-icon>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@vue/composition-api'
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'

export default defineComponent({
  setup () {
    return {
      activeIndex: ref(0),
      logModel: reactive(useLogModel()),
      uiModel: reactive(useUiModel())
    }
  }
})
</script>
