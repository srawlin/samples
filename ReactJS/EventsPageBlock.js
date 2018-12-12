import React, {PropTypes} from "react";
import classNames from "classnames";

import BasePageBlock from "common/parts/BasePageBlock";
import EventsPaginableContainer from "pages/timeline/events/EventsPaginableContainer";
import InlineEditableInput from "common/components/edit/InlineEditableInput";

import {filtersNode, descriptor} from "pages/timeline/events/EventsPageBlockFiltersDescriptor";
import {getFullCursorPathString} from "common/utils/CursorUtils";
import constants from "common/Constants";

const editTypes = constants.HOUSE_EDIT_TYPES;

export default class EventsPageBlock extends BasePageBlock {
    static propTypes = {
        // Actions to fetch events and filter choices
        actions: PropTypes.object.isRequired,

        // Communication Urls data
        communicationUrls: PropTypes.object,

        // Customer events
        events: PropTypes.object,

        // Filters
        filters: PropTypes.object.isRequired,

        houses: PropTypes.object,

        // If block is loading
        isLoading: PropTypes.bool,

        // Router obj
        router: PropTypes.object,

        // Given house
        selectedHouse: PropTypes.object
    };

    componentDidMount() {
        const {actions, router, selectedHouse} = this.props;
        const content = selectedHouse.get("content");
        const customerId = content.owner.id;
        actions.initFilters({descriptor, query: router.query});
        actions.fetchEvents({customerId});
        actions.fetchEventChoices();
        actions.fetchHouses({customerId});
        actions.fetchCommunicationUrls({houseId: content.id});
    }

    componentWillUnmount() {
        const {actions} = this.props;
        actions.invalidateNodeFilters({filtersNode, descriptor});
        actions.invalidateEvents();
        actions.invalidateHouses();
        actions.invalidateCommunicationUrls();
    }

    handleEditZendeskIdApplied = ({path, value}) => {
        const {actions, selectedHouse} = this.props;
        const content = selectedHouse.get("content");
        actions.updateHouse({
            old: content,
            path,
            type: editTypes.CUSTOMER,
            value
        }).then(() => actions.fetchCommunicationUrls({houseId: content.id}), () => {});
    };

    handleEditZendeskIdToggled = ({pathString}) => {
        const {actions} = this.props;
        actions.toggleHouseEdit({pathString});
    };

    renderLink(url, label) {
        return url ? (
            <div className="pull-left">
                <a
                    className="ezh-margin-right-30"
                    href={url}
                    target="_blank">
                    {label} &raquo;
                </a>
            </div>
        ) : null;
    }

    renderLinks() {
        const {communicationUrls} = this.props;
        const content = communicationUrls.get("content");

        if (!content) {
            return null;
        }

        return (
            <div className="clearfix app-crm-header-links-right">
                {this.renderLink(content.pipedriveUrl, "Pipedrive Deal")}
                {this.renderLink(content.helpscoutUrl, "Helpscout Conversations")}
                {this.renderZendeskLink()}
            </div>
        );
    }

    renderZendeskLink() {
        const {selectedHouse, communicationUrls} = this.props;
        const editingItems = selectedHouse.get("editingItems");
        const content = selectedHouse.get("content");
        const urls = communicationUrls.get("content");
        const isUrlsLoading = communicationUrls.get("isLoading");

        const linkFormat = () => {
            return (
                <a
                    href={urls.zendeskUrl}
                    target="_blank">
                    <span>Zendesk Communications &raquo;</span>
                </a>
            );
        };

        const emptyZendeskUrl = (
            <a
                className="ezh-add-link"
                href="#"
                onClick={(evt) => evt.preventDefault()}>
                <span><i className="fa fa-plus-circle"/>Add Zendesk Link</span>
            </a>
        );

        const owner = content.owner;
        let editingItem = editingItems.get(getFullCursorPathString(owner, "zendeskId"));
        if (!editingItem && isUrlsLoading && !communicationUrls.get("content")) {
            editingItem = {
                isLoading: true
            };
        }

        const inputContainerClass = classNames("pull-left", "app-crm-zendesk-link-container", {
            "app-crm-zendesk-link-container-center": editingItem
        });

        return (
            <div className={inputContainerClass}>
                <InlineEditableInput
                    className="form-control"
                    editingItem={editingItem}
                    emptyValue={emptyZendeskUrl}
                    formatEditNonActivated={linkFormat}
                    keyName="zendeskId"
                    onEditApplied={this.handleEditZendeskIdApplied}
                    onEditToggled={this.handleEditZendeskIdToggled}
                    placeholder="Zendesk ID"
                    shouldClickEditButton={!!owner.zendeskId}
                    showEditActivateButton={!!owner.zendeskId}
                    source={owner}/>
            </div>
        );
    }

    renderHeaderIcon() {
        return (
            <i className="fa fa-clock-o"/>
        );
    }

    renderHeaderTitle() {
        return "Timeline";
    }

    renderHeaderRight() {
        const {isLoading} = this.props;
        if (!isLoading) {
            return this.renderLinks();
        }
    }

    renderContent() {
        const {actions, selectedHouse, houses, events, filters} = this.props;
        const iterable = events.get("iterable");
        const housesIterable = houses.get("iterable");
        if (!iterable || !housesIterable) {
            return null;
        }

        return (
            <div>
                <EventsPaginableContainer
                    actions={actions}
                    className="table"
                    data={events}
                    filters={filters}
                    filtersDescriptor={descriptor}
                    filtersNode={filtersNode}
                    houses={houses}
                    selectedHouse={selectedHouse.get("content")} />
            </div>
        );
    }
}
