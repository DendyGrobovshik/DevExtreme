import {
    flatViews,
} from './utils';

const VIEW_SWITCHER_CLASS = 'dx-scheduler-view-switcher';

export function getDropDownViewSwitcher(header, item) {
    const selectedView = header.option('currentView');

    // Нужно патчить уровнем выше
    let items = header.views;
    if(!items.includes(selectedView)) {
        items = [selectedView, ...items];
    }

    items = flatViews(items);

    return {
        widget: 'dxDropDownButton',
        locateInMenu: 'never',
        location: item.location,
        cssClass: VIEW_SWITCHER_CLASS,
        options: {
            ...item,
            items,
            useSelectMode: true,
            keyExpr: 'type',
            selectedItemKey: selectedView,
            displayExpr: 'text',
            splitButton: true,
            onItemClick: (e) => {
                const view = e.itemData.type;

                header._updateCurrentView(view);
            },
            onInitialized: (e) => {
                const viewSwitcher = e.component;

                header._addEvent('currentView', (view) => {
                    viewSwitcher.option('selectedItemKey', view);
                });
            }
        },
    };
}

export function getViewSwitcher(header, item) {
    const selectedView = header.option('currentView');

    let items = header.views;
    if(!items.includes(selectedView)) {
        items = [selectedView, ...items];
    }

    items = flatViews(items);

    // TODO
    items = items.map(item => {
        return {
            ...item,
            width: '100px',
        };
    });

    return {
        ...item,
        widget: 'dxButtonGroup',
        locateInMenu: 'auto',
        cssClass: VIEW_SWITCHER_CLASS,
        options: {
            items,
            keyExpr: 'type',
            selectedItemKeys: [selectedView],
            stylingMode: 'text',
            height: '54px',
            onItemClick: (e) => {
                const view = e.itemData.type;

                header._updateCurrentView(view);
            },
            onInitialized: (e) => {
                const viewSwitcher = e.component;

                header._addEvent('currentView', (view) => {
                    viewSwitcher.option('selectedItemKeys', [view]);
                });
            }
        },
    };
}
