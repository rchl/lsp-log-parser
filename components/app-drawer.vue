<template>
    <v-navigation-drawer v-model="uiModel.drawerVisible.value">
        <v-list
            v-if="logModel.selectedFilters.value.length"
            density="compact"
            nav
        >
            <v-list-subheader>Sessions</v-list-subheader>
            <v-list-item
                v-for="filter in logModel.selectedFilters.value"
                :key="filter.name"
                :title="filter.name"
                @click="filter.enabled = !filter.enabled"
            >
                <template #append>
                    <v-icon color="primary">
                        {{ filter.enabled ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
                    </v-icon>
                </template>
            </v-list-item>
        </v-list>

        <v-divider />

        <v-list
            density="compact"
            nav
            select-strategy="classic"
            :selected="uiModel.selectedCategoryTypes.value"
            @update:selected="val => onCategoryChanged(val as CategoryType[])"
        >
            <v-list-subheader>Filter by category</v-list-subheader>
            <v-list>
                <v-btn
                    variant="text"
                    @click="toggleAllCategories">
                    Toggle all
                </v-btn>
            </v-list>
            <v-list-item
                v-for="category in uiModel.CATEGORIES"
                :key="category.name"
                :value="category.type"
                :title="category.name"
            >
                <template #append="{ isSelected }">
                    <v-list-item-action>
                        <v-checkbox-btn :model-value="isSelected" />
                    </v-list-item-action>
                </template>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useLogModel } from '~/models/log-model'
import { useUiModel } from '~/models/ui-model'
import type { CategoryType } from '~/models/ui-model'

const logModel = useLogModel()
const uiModel = useUiModel()

function onCategoryChanged(selected: CategoryType[]) {
    uiModel.selectedCategoryTypes.value = selected
}

function toggleAllCategories() {
    if (uiModel.selectedCategoryTypes.value.length) {
        uiModel.selectedCategoryTypes.value = []
    } else {
        uiModel.selectAllCategories()
    }
}
</script>
