import { Select, type SelectProps } from 'antd';
import type { SelectPopupSemanticClassNames, SelectSemanticClassNames } from 'antd/es/select';
import { cn } from '@blog/utils';

export type AdminSelectProps<ValueType extends string | number = string> = Omit<
  SelectProps<ValueType>,
  'popupClassName' | 'dropdownClassName'
> & {
  /** 在表单栅格内占满宽度 */
  block?: boolean;
};

/** antd 6：Resolvable 回调返回类型仅为 Readonly<SelectSemanticClassNames>，未声明 popup，运行时可与 classNames.popup 并存 */
type SelectClassNamesResolved = Readonly<SelectSemanticClassNames> & {
  popup?: SelectPopupSemanticClassNames;
};

function mergeClassNames<ValueType extends string | number = string>(
  user: SelectProps<ValueType>['classNames'] | undefined
): SelectProps<ValueType>['classNames'] {
  const popupRoot = cn('rounded-lg shadow-lg');
  if (user === undefined) {
    return { popup: { root: popupRoot } };
  }
  if (typeof user === 'function') {
    return (info) => {
      const resolved = user(info) as SelectClassNamesResolved;
      return {
        ...resolved,
        popup: {
          ...resolved.popup,
          root: cn(popupRoot, resolved.popup?.root),
        },
      };
    };
  }
  return {
    ...user,
    popup: {
      ...user.popup,
      root: cn(popupRoot, user.popup?.root),
    },
  };
}

/**
 * 统一使用 antd Select，避免原生下拉在各系统下样式不一致。
 */
export function AdminSelect<ValueType extends string | number = string>({
  block = false,
  className,
  classNames: userClassNames,
  ...props
}: AdminSelectProps<ValueType>) {
  const classNames = mergeClassNames<ValueType>(userClassNames);

  return (
    <Select<ValueType>
      className={cn(block && 'w-full', 'min-w-0', className)}
      popupMatchSelectWidth
      classNames={classNames}
      {...props}
    />
  );
}
