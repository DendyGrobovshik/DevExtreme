import {
  CSSAttributes,
  Component, ComponentBindings, JSXComponent, OneWay, JSXTemplate, Template,
  Ref, RefObject, Event,
} from '@devextreme-generator/declarations';
import type { AppointmentTemplateData } from '../../../../ui/scheduler';
import { AppointmentTemplateProps, AppointmentViewModel } from './types';
import { getAppointmentStyles } from './utils';
import { AppointmentContent } from './content';
import { Widget } from '../../common/widget';

export const viewFunction = ({
  text,
  dateText,
  styles,
  data,
  index,
  ref,
  onItemClick,
  props: {
    appointmentTemplate,
  },
}: Appointment): JSX.Element => {
  const AppointmentTemplate = appointmentTemplate;
  return (
    <Widget
      onClick={onItemClick}
    >
      <div
        ref={ref}
        className="dx-scheduler-appointment"
        style={styles}
      >
        {
          !!AppointmentTemplate && (
            <AppointmentTemplate data={data} index={index} />
          )
        }
        {
          !AppointmentTemplate && (
            <AppointmentContent text={text} dateText={dateText} />
          )
        }
      </div>
    </Widget>
  );
};

@ComponentBindings()
export class AppointmentProps {
  @OneWay() viewModel!: AppointmentViewModel;

  @OneWay() index = 0;

  @Template() appointmentTemplate?: JSXTemplate<AppointmentTemplateProps>;

  @Event() onItemClick!: (e: {
    data: AppointmentViewModel[];
    target: HTMLElement | undefined;
    index: number;
  }) => void;
}

@Component({
  defaultOptionRules: null,
  view: viewFunction,
})
export class Appointment extends JSXComponent<AppointmentProps, 'viewModel' | 'onItemClick'>() {
  @Ref() ref!: RefObject<HTMLElement>;

  get text(): string { return this.props.viewModel.appointment.text; }

  get dateText(): string { return this.props.viewModel.info.dateText; }

  get styles(): CSSAttributes { return getAppointmentStyles(this.props.viewModel); }

  get data(): AppointmentTemplateData {
    return {
      appointmentData: this.props.viewModel.info.appointment,
      targetedAppointmentData: this.props.viewModel.appointment,
    };
  }

  get index(): number {
    return this.props.index;
  }

  onItemClick(): void {
    const e = {
      data: [this.props.viewModel],
      target: this.ref.current!,
      index: this.props.index,
    };

    this.props.onItemClick(e);
  }
}
