import {
  Component,
  ComponentBindings,
  JSXComponent,
  OneWay,
  Event,
  Consumer,
} from '@devextreme-generator/declarations';
import { ConfigContextValue, ConfigContext } from '../../../common/config_context';
import { resolveRtlEnabled } from '../../../utils/resolve_rtl';
import devices from '../../../../core/devices';

import { Toolbar } from '../../toolbar/toolbar';

import '../../../../ui/button_group';
import '../../../../ui/drop_down_button';

import dateUtils from '../../../../core/utils/date';
import {
  getCaption, nextWeek,
  getStep, getViewName,
  getNextIntervalDate,
} from '../../../../ui/scheduler/header/utils';
import { formToolbarItem, formatViews, isMonthView } from './utils';

import type { DateNavigatorTextInfo } from '../../../../ui/scheduler';
import {
  ItemOptions, Direction, ItemView,
} from './types';
import { ViewType } from '../types.d';

import { SchedulerProps, ViewProps } from '../props';
import { SchedulerToolbarItem } from './props';
import { ToolbarItem } from '../../toolbar/toolbar_props';

const { trimTime } = dateUtils;

export const viewFunction = (viewModel: SchedulerToolbar): JSX.Element => (
  <div
    className="dx-scheduler-header"
  >
    <Toolbar
      items={viewModel.items}
    />
  </div>
);

@ComponentBindings()
export class SchedulerToolbarBaseProps {
  @OneWay() items!: SchedulerToolbarItem[];

  @OneWay() views!: (ViewType | ViewProps)[];

  @Event() onCurrentViewUpdate!: (view: string | ViewType) => void;

  @OneWay() currentDate!: Date;

  @Event() onCurrentDateUpdate!: (date: Date) => void;

  @OneWay() startViewDate!: Date;

  @OneWay() intervalCount = 1;

  @OneWay() firstDayOfWeek = 0;

  @OneWay() agendaDuration = 7;

  @OneWay() useShortDateFormat = !devices.real().generic || devices.isSimulator();

  @OneWay() customizationFunction?: (caption: DateNavigatorTextInfo) => string;
}

export type SchedulerToolbarProps = SchedulerToolbarBaseProps
& Pick<SchedulerProps, 'currentView' | 'min' | 'max' | 'useDropDownViewSwitcher' | 'rtlEnabled'>;

@Component({ view: viewFunction })
export default class SchedulerToolbar extends JSXComponent<SchedulerToolbarProps, 'items' | 'views' | 'onCurrentViewUpdate' | 'currentDate' | 'onCurrentDateUpdate' | 'startViewDate'>() {
  @Consumer(ConfigContext)
  config?: ConfigContextValue;

  cssClass = 'dx-scheduler-header';

  get step(): string {
    return getStep(this.props.currentView) as string;
  }

  get displayedDate(): Date {
    const startViewDate = new Date(this.props.startViewDate);

    if (isMonthView(this.props.currentView)) {
      return nextWeek(startViewDate);
    }

    return startViewDate;
  }

  get caption(): DateNavigatorTextInfo {
    const options = {
      step: this.step,
      intervalCount: this.props.intervalCount,
      firstDayOfWeek: this.props.firstDayOfWeek,
      agendaDuration: this.props.agendaDuration,
      date: this.displayedDate,
    };

    return getCaption(
      options,
      this.props.useShortDateFormat,
      this.props.customizationFunction,
    ) as DateNavigatorTextInfo;
  }

  get captionText(): string {
    return this.caption.text;
  }

  get views(): ItemView[] {
    return formatViews(this.props.views);
  }

  get selectedView(): string {
    return getViewName(this.props.currentView) as string;
  }

  setCurrentView(view: ItemView): void {
    if (view.name !== this.props.currentView) {
      this.props.onCurrentViewUpdate(view.name);
    }
  }

  setCurrentDate(date: Date): void {
    if (date.getTime() !== this.props.currentDate.getTime()) {
      this.props.onCurrentDateUpdate(new Date(date));
    }
  }

  get intervalOptions(): {
    step: string;
    intervalCount: number;
    firstDayOfWeek: number;
    agendaDuration: number;
  } {
    return {
      step: this.step,
      intervalCount: this.props.intervalCount,
      firstDayOfWeek: this.props.firstDayOfWeek,
      agendaDuration: this.props.agendaDuration,
    };
  }

  getNextDate(direction: Direction, initialDate?: Date): Date {
    const date = initialDate ?? this.props.currentDate;

    const options = { ...this.intervalOptions, date };

    return getNextIntervalDate(options, direction);
  }

  updateDateByDirection(direction: Direction): void {
    const date = this.getNextDate(direction);

    this.setCurrentDate(date);
  }

  isPreviousButtonDisabled(): boolean {
    if (this.props.min === undefined) {
      return false;
    }

    const min = trimTime(new Date(this.props.min));

    const { startDate } = this.caption;

    const previousDate = this.getNextDate(-1, startDate);
    return previousDate < min;
  }

  isNextButtonDisabled(): boolean {
    if (this.props.max === undefined) {
      return false;
    }

    const max = new Date(new Date(this.props.max).setHours(23, 59, 59));

    const { endDate } = this.caption;

    const nextDate = this.getNextDate(1, endDate);
    return nextDate > max;
  }

  // eslint-disable-next-line class-methods-use-this
  showCalendar(): void {
    // TODO
  }

  get rtl(): boolean {
    const { rtlEnabled } = this.props;
    return !!resolveRtlEnabled(rtlEnabled, this.config);
  }

  get items(): ToolbarItem[] {
    const options: ItemOptions = {
      useDropDownViewSwitcher: this.props.useDropDownViewSwitcher,
      selectedView: this.selectedView,
      views: this.views,
      setCurrentView: (view) => this.setCurrentView(view),
      showCalendar: () => this.showCalendar(),
      captionText: this.captionText,
      updateDateByDirection: (direction) => this.updateDateByDirection(direction),
      isPreviousButtonDisabled: this.isPreviousButtonDisabled(),
      isNextButtonDisabled: this.isNextButtonDisabled(),
      rtlEnabled: this.rtl,
    };

    return this.props.items
      .map((item) => formToolbarItem(item, options));
  }
}
