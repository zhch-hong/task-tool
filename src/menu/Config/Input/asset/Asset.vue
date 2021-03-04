<template>
  <draggable v-model="data" v-bind="dragOptions" class="data-draggable" tag="ul" @update="writeFile(data)">
    <li v-for="(item, index) in data" class="data-li" :key="item.uuid">
      <InlineInput :value="item.value" class="field" @input="updateRow(index, 'value', $event)" />
      <InlineInput :value="item.name" class="desc" @input="updateRow(index, 'name', $event)" />
      <span title="删除" class="delete" @click="deleteRow(index)">x</span>
    </li>
  </draggable>
</template>
<script lang="ts">
import Vue from 'vue';
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { ConfigFilesModule, INPUT_PATH } from '@/store/modules/config-files';

import draggable from 'vuedraggable';
import InlineInput from '@/components/InlineInput.vue';
import { writeFileText } from '@/utils';

// 财富类型的数据，注意：这个地方是引用传递
const REFREENCE = ConfigFilesModule.inputData.find((o) => o.value === 'asset') as Record<string, any>;

export default Vue.extend({
  components: {
    draggable,
    InlineInput,
  },

  data() {
    const data: Record<string, string>[] = REFREENCE ? _.cloneDeep(REFREENCE.select) : [];

    data.forEach((item) => (item['uuid'] = uuid()));
    console.log(data);

    return {
      data: data,
      dragOptions: {
        animation: 300,
        dragClass: 'drag-class',
      },
    };
  },

  methods: {
    insertRow(params: Record<string, string>) {
      params['uuid'] = uuid();
      this.data.push(params);
      this.writeFile(this.data);
    },

    deleteRow(index: number): void {
      this.$confirm('确定删除该条配置吗？', '提示')
        .then(() => {
          this.data.splice(index, 1);
          this.writeFile(this.data);
        })
        .catch(() => {
          /** */
        });
    },

    updateRow(index: number, field: string, value: string): void {
      const object = _.cloneDeep(this.data[index]);
      object[field] = value;
      this.data.splice(index, 1, object);
      this.writeFile(this.data);
    },

    writeFile(data: Record<string, string>[]) {
      const _data = _.cloneDeep(data);
      _data.forEach((item) => delete item.uuid);

      REFREENCE.select = _data;

      // 要写入所有数据，因为获得类型，枚举类型，财富类型都是在同一个文件中存储的
      writeFileText(INPUT_PATH, ConfigFilesModule.inputData);
    },
  },
});
</script>
<style lang="scss" scoped>
ul.data-draggable {
  margin: 0 15px;
  padding: 0;
  list-style-type: none;
  color: #606266;
  cursor: default;
  .data-li {
    display: flex;
    line-height: 40px;
    .field,
    .desc {
      margin: 0;
    }
    .field {
      width: 400px;
    }
    .desc {
      width: 400px;
    }
    .delete {
      transform: scaleX(1.3);
      &:hover {
        color: #f56c6c;
      }
    }
  }
}

.drag-class {
  background-color: transparent;
  color: transparent;
  border: none;
}
</style>
