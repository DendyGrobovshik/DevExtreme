/* eslint-disable max-classes-per-file */
import {
    Component, JSXComponent, Ref, RefObject, Effect, Mutable, Method,
} from '@devextreme-generator/declarations';
/* eslint-disable import/named */
import SchedulerCalendar from '../../../ui/scheduler/header/calendar';

import { DomComponentWrapper } from '../common/dom_component_wrapper';
import {
    ComponentBindings, OneWay,
} from '@devextreme-generator/declarations';

import { BaseWidgetProps } from '../common/base_props';

export const viewFunction = ({
    wrapperRef,
    props,
    restAttributes,
}: Calendar): JSX.Element => {
    return (
        <DomComponentWrapper
            componentType={SchedulerCalendar}
            componentProps={props}
            ref={wrapperRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restAttributes}
        />
    )
};

@ComponentBindings()
export class CalendarProps extends BaseWidgetProps {
    @OneWay() date?: Date;

    @OneWay() min?: Date | number | string;

    @OneWay() max?: Date | number | string;

    @OneWay() firstDayOfWeek?: number;

    @OneWay() onValueChanged?: (e: any) => void;

    @OneWay() focusStateEnabled = true;

    @OneWay() tabIndex = 0;
}

@Component({
    defaultOptionRules: null,
    view: viewFunction,
})
export class Calendar extends JSXComponent<CalendarProps>() {
    @Ref() wrapperRef!: RefObject<DomComponentWrapper>;

    @Mutable()
    instance: any;

    @Method()
    show(target: any): void {
        this.instance.show(target);
    }

    @Method()
    hide(): void {
        this.instance.hide();
    }

    @Effect()
    setupWidget(): void {
        console.log(this.wrapperRef);

        this.instance = this.wrapperRef.current?.getInstance();
    }
}
