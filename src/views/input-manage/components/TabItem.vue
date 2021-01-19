<template>
  <draggable
    v-model="data"
    v-bind="dragOptions"
    class="data-draggable"
    tag="ul"
    @update="$emit('update-data', data)"
  >
    <li v-for="(item, index) in data" class="data-li" :key="item.uuid">
      <inline-input
        :value="item.value"
        class="field"
        @input="updateRow(index, 'value', $event)"
      />
      <inline-input
        :value="item.name"
        class="desc"
        @input="updateRow(index, 'name', $event)"
      />
      <span title="删除" class="delete" @click="deleteRow(index)">x</span>
    </li>
  </draggable>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';

import draggable from 'vuedraggable';
import InlineInput from '@/components/InlineInput.vue';

@Component({
  components: {
    draggable,
    InlineInput,
  },
})
export default class TabItem extends Vue {
  @Prop({ type: Array, default: () => [] }) tableData!: Record<
    string,
    string
  >[];

  data = cloneDeep(this.tableData);
  dragOptions = {
    animation: 300,
    dragClass: 'drag-class',
  };

  @Watch('tableData', { deep: true })
  dataWatch(value: Record<string, string>[]): void {
    this.data = cloneDeep(value);
  }

  deleteRow(index: number): void {
    this.$confirm('确定删除该条配置吗？', '提示')
      .then(() => {
        this.data.splice(index, 1);
        this.$emit('update-data', this.data);
      })
      .catch(() => {
        /** */
      });
  }

  updateRow(index: number, field: string, value: string): void {
    const object = cloneDeep(this.data[index]);
    object[field] = value;
    this.data.splice(index, 1, object);
    this.$emit('update-data', this.data);
  }
}
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
