// square.config.ts
// -----------------------------------------------------------------------------
// AUTO-GENERATED CONFIGURATION FILE.
// DO NOT modify the sections labeled "AUTO-GENERATED".
//
// Copyright (c) 2025 Smackcoders. All rights reserved.
// This file is subject to the Smackcoders Proprietary License.
// Unauthorized copying or distribution is strictly prohibited.
// -----------------------------------------------------------------------------

export const XappName = "Square";
export const modules = [
  {
    "module": "Customers",
    "actions": [
      "create",
      "update",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": [
      "new_customer",
      "updated_customer"
    ]
  },
  {
    "module": "Orders",
    "actions": [
      "create",
      "get",
      "getMany"
    ],
    "triggers": [
      "new_order",
      "updated_order"
    ]
  },
  {
    "module": "Payments",
    "actions": [
      "create",
      "refund",
      "get",
      "getMany"
    ],
    "triggers": [
      "new_payment",
      "refunded_payment"
    ]
  },
  {
    "module": "Invoices",
    "actions": [
      "create",
      "update",
      "getMany",
      "publish"
    ],
    "triggers": [
      "new_invoice",
      "invoice_paid",
      "invoice_updated"
    ]
  },
  {
    "module": "Catalog",
    "actions": [
      "create",
      "delete",
      "get",
      "getMany"
    ],
    "triggers": [
      "new_catalog_item",
      "updated_catalog_item"
    ]
  },

  {
    "module": "Locations",
    "actions": [
      "get",
      "getMany"
    ],
    "triggers": []
  }
];


import { CustomLogger } from 'src/logger/custom.logger';
import { square } from './square.controller';
export const redirect = "https://workflow.xapplets.com/exit";



const invoicecreateAdditionalFields = [
  {
    displayName: "Reminders Schedule Days",
    name: "invoice__payment_requests__reminders__relative_scheduled_days",
    type: "date",
    description: "time of the reminders",
    default: "",
    items: [],
    required: false,
  },
  {
    displayName: "Message",
    name: "invoice__payment_requests__reminders__message",
    type: "string",
    description: "message of the reminders",
    default: "",
    items: [],
    required: false,
  },
  {
    displayName: "Delivery Method",
    name: "invoice__delivery_method",
    type: "dropdown",
    description: "delivery_method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "EMAIL", value: "EMAIL" },
      { name: "SHARE_MANUALLY", value: "SHARE_MANUALLY" },
      { name: "SMS", value: "SMS" },
    ]
  },
  {
    displayName: "Accept Payment Method Card",
    name: "invoice__delivery_method__card",
    type: "dropdown",
    description: "Accept method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Gift Card",
    name: "invoice__delivery_method__square_gift_card",
    type: "dropdown",
    description: "Accept method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Bank Account",
    name: "invoice__delivery_method__bank_account",
    type: "dropdown",
    description: "Accept method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Buy Now Pay Later",
    name: "invoice__delivery_method__buy_now_pay_later",
    type: "dropdown",
    description: "delivery_method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Cash App Pay",
    name: "invoice__delivery_method__cash_app_pay",
    type: "dropdown",
    description: "Accept Payment of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Custome Fields Lable",
    name: "invoice__custom_fields||label",
    type: "string",
    description: "custom_fields label of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Custome Fields Value",
    name: "invoice__custom_fields||value",
    type: "string",
    description: "custom_fields value of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Custome Fields",
    name: "invoice__custom_fields||placement",
    type: "string",
    description: "custom_fields placement of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Sales Date Or Service Date",
    name: "invoice__sale_or_service_date",
    type: "string",
    description: "Sales or Service Date of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Store Payment Method",
    name: "invoice__store_payment_method_enabled",
    type: "string",
    description: "Store Payment Method Enable of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
]

const invoiceUpdateAdditionalFields = [
  {
    displayName: "Location ID",
    name: "invoice__location_id",
    type: "string",
    default: "",
    item: [],
    required: false
  },
  {
    displayName: "Order ID",
    name: "invoice__order_id",
    type: "string",
    default: "",
    item: [],
    required: false
  },
  {
    displayName: "Customer ID",
    name: "invoice__primary_recipient__customer_id",
    type: "string",
    default: "",
    item: [],
    required: false
  },
  {
    displayName: "Delivery Method",
    name: "invoice__delivery_method",
    type: "string",
    default: "",
    item: [],
    required: false
  },
  {
    displayName: "Payment Requests Type",
    name: "invoice__payment_requests__request_type",
    type: "dropdown",
    default: "",
    item: [],
    description: "payment requests type",
    options: [
      { name: "BALANCE", value: "BALANCE" },
      { name: "DEPOSIT", value: "DEPOSIT" },
      { name: "INSTALLMENT", value: "INSTALLMENT" },
    ],
    required: false
  },
  {
    displayName: "Payment Requests Type",
    name: "invoice__payment_requests__due_date",
    type: "date",
    default: "",
    item: [],
    description: " payment requests due date",
  },
  {
    displayName: "Payment Requests Tripping Enable",
    name: "invoice__payment_requests__tipping_enabled",
    type: "date",
    default: "",
    item: [],
    description: " payment requests Tripping",
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ],

  },
  {
    displayName: "Payment Requests Payment Source",
    name: "invoice__payment_requests__automatic_payment_source",
    type: "date",
    default: "",
    item: [],
    description: " payment requests Tripping",
    required: false,
    options: [
      { name: "NONE", value: "NONE" },
      { name: "CARD_ON_FILE", value: "CARD_ON_FILE" },
      { name: "BANK_ON_FILE", value: "BANK_ON_FILE" },
    ],
  },
  {
    displayName: "Reminders Schedule Days",
    name: "invoice__payment_requests__reminders__relative_scheduled_days",
    type: "date",
    description: "time of the reminders",
    default: "",
    items: [],
    required: false,
  },
  {
    displayName: "Message",
    name: "invoice__payment_requests__reminders__message",
    type: "string",
    description: "message of the reminders",
    default: "",
    items: [],
    required: false,
  },
  {
    displayName: "Delivery Method",
    name: "invoice__delivery_method",
    type: "dropdown",
    description: "delivery_method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "EMAIL", value: "EMAIL" },
      { name: "SHARE_MANUALLY", value: "SHARE_MANUALLY" },
      { name: "SMS", value: "SMS" },
    ]
  },
  {
    displayName: "Accept Payment Method Card",
    name: "invoice__delivery_method__card",
    type: "dropdown",
    description: "Accept method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Gift Card",
    name: "invoice__delivery_method__square_gift_card",
    type: "dropdown",
    description: "Accept method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Bank Account",
    name: "invoice__delivery_method__bank_account",
    type: "dropdown",
    description: "Accept method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Buy Now Pay Later",
    name: "invoice__delivery_method__buy_now_pay_later",
    type: "dropdown",
    description: "delivery_method of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Accept Payment Method Cash App Pay",
    name: "invoice__delivery_method__cash_app_pay",
    type: "dropdown",
    description: "Accept Payment of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    displayName: "Custome Fields Lable",
    name: "invoice__custom_fields||label",
    type: "string",
    description: "custom_fields label of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Custome Fields Value",
    name: "invoice__custom_fields||value",
    type: "string",
    description: "custom_fields value of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Custome Fields",
    name: "invoice__custom_fields||placement",
    type: "string",
    description: "custom_fields placement of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Sales Date Or Service Date",
    name: "invoice__sale_or_service_date",
    type: "string",
    description: "Sales or Service Date of invoice",
    default: "",
    items: [],
    required: false
  },
  {
    displayName: "Store Payment Method",
    name: "invoice__store_payment_method_enabled",
    type: "string",
    description: "Store Payment Method Enable of invoice",
    default: "",
    items: [],
    required: false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
]

const getManyInvoices = [
  {
    "displayName": "Cursor",
    "name": "cursor",
    "type": "string",
    "description": "A pagination cursor returned by a previous call to this endpoint. Provide this cursor to retrieve the next set of results for your original query. For more information, see Pagination",
    "default": "",
    "required": false
  },
  {
    "displayName": "Limit",
    "name": "limit",
    "type": "integer",
    "description": "The maximum number of invoices to return (200 is the maximum limit). If not provided, the server uses a default limit of 100 invoices",
    "default": "",
    "required": false
  }
]

// customer
const customCreateFields = [
  {
    "displayName": "Company Name",
    "name": "company_name",
    "type": "string",
    "description": "A business name associated with the customer profile. The maximum length for this value is 500 characters",
    "default": "",
    "required": false
  },
  {
    "displayName": "Nickname",
    "name": "nickname",
    "type": "string",
    "description": "A nickname for the customer profile",
    "default": "",
    "required": false
  },
  {
    "displayName": "Reference ID",
    "name": "reference_id",
    "type": "string",
    "description": "An optional second ID used to associate the customer profile with an entity in another system. The maximum length for this value is 100 characters",
    "default": "",
    "required": false
  },
  {
    "displayName": "Note",
    "name": "note",
    "type": "string",
    "description": "A custom note associated with the customer profile",
    "default": "",
    "required": false
  },
  {
    "displayName": "Birthday",
    "name": "birthday",
    "type": "date",
    "description": "The birthday associated with the customer profile, in YYYY-MM-DD or MM-DD format. For example, specify 1998-09-21 for September 21, 1998, or 09-21 for September 21. Birthdays are returned in YYYY-MM-DD format, where YYYY is the specified birth year or 0000 if a birth year is not specified",
    "default": "",
    "required": false
  },
  {
    "displayName": "Tax Id EU / United Kingdom Vat",
    "name": "tax_ids||eu_vat",
    "type": "string",
    "description": "The tax ID associated with the customer profile. This field is available only for customers of sellers in EU countries or the United Kingdom.",
    "default": "",
    "required": false
  },

]

const getManyCustomers = [
  {
    "displayName": "Cursor",
    "name": "cursor",
    "type": "string",
    "description": "A pagination cursor returned by a previous call to this endpoint. Provide this cursor to retrieve the next set of results for your original query. For more information, see Pagination",
    "default": "",
    "required": false
  },
  {
    "displayName": "Limit",
    "name": "limit",
    "type": "integer",
    "description": "The maximum number of results to return in a single page. This limit is advisory. The response might contain more or fewer results. If the specified limit is less than 1 or greater than 100, Square returns a 400 VALUE_TOO_LOW or 400 VALUE_TOO_HIGH error. The default value is 100. For more information, see Pagination",
    "default": "",
    "required": false
  },
  {
    "displayName": "Sort Field",
    "name": "sort_field",
    "type": "string",
    "description": "Indicates how customers should be sorted. The default value is DEFAULT",
    "default": "",
    "required": false,
    "options": [
      { name: "DEFAULT", value: "DEFAULT" },
      { name: "CREATED_AT", value: "CREATED_AT" }
    ]
  },
  {
    "displayName": "Sort Order",
    "name": "sort_order",
    "type": "dropdown",
    "description": "Indicates whether customers should be sorted in ascending (ASC) or descending (DESC) order. The default value is ASC",
    "default": "",
    "required": false,
    "options": [
      { name: "ASC", value: "ASC" },
      { name: "DESC", value: "DESC" }
    ]
  },
  {
    "displayName": "Count",
    "name": "count",
    "type": "dropdown",
    "description": "Indicates whether to return the total count of customers in the count field of the response. The default value is false",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  }
]

// catalog
const createCatalog = [
  {
    "displayName": "Version",
    "name": "object__version",
    "type": "integer",
    "description": "The version of the object. When updating an object, the version supplied must match the version in the database, otherwise the write will be rejected as conflicting",
    "default": "",
    "required": false
  },
  {
    "displayName": "Name",
    "name": "object__custom_attribute_values__value__name",
    "type": "string",
    "description": "The name of the custom attribute",
    "default": "",
    "required": false
  },
  {
    "displayName": "Number Value",
    "name": "object__custom_attribute_values__number_value",
    "type": "string",
    "description": "Populated if type = NUMBER. Contains a string representation of a decimal number, using a . as the decimal separator",
    "default": "",
    "required": false
  },
  {
    "displayName": "Boolean Value",
    "name": "object__custom_attribute_values__boolean_value",
    "type": "dropdown",
    "description": "A true or false value",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Selection UID Values",
    "name": "object__custom_attribute_values__value__selection_uid_values",
    "type": "string",
    "description": "One or more choices from allowed_selections. Populated if type = SELECTION",
    "default": [],
    "required": false
  },
  {
    "displayName": "Key",
    "name": "object__custom_attribute_values__value__key",
    "type": "string",
    "description": "Read only If the associated CatalogCustomAttributeDefinition object is defined by another application, this key is prefixed by the defining application ID. For example, if the CatalogCustomAttributeDefinition has a key attribute of \"cocoa_brand\" and the defining application ID is \"abcd1234\", this key is \"abcd1234:cocoa_brand\" when the application making the request is different from the application defining the custom attribute definition. Otherwise, the key is simply \"cocoa_brand\"",
    "default": "",
    "required": false
  },
  {
    "displayName": "Present at All Locations",
    "name": "object__present_at_all_locations",
    "type": "dropdown",
    "description": "If true, this object is present at all locations (including future locations), except where specified in the absent_at_location_ids field. If false, this object is not present at any locations (including future locations), except where specified in the present_at_location_ids field. If not specified, defaults to true",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Present at Location IDs",
    "name": "object__present_at_location_ids",
    "type": "string",
    "description": "A list of locations where the object is present, even if present_at_all_locations is false. This can include locations that are deactivated",
    "default": "",
    "required": false
  },
  {
    "displayName": "Absent at Location IDs",
    "name": "object__absent_at_location_ids",
    "type": "string",
    "description": "A list of locations where the object is not present",
    "default": "",
    "required": false
  },
  {
    "displayName": "Version",
    "name": "object__item_data__variations__version",
    "type": "integer",
    "description": "The version of the object. When updating an object, the version supplied must match the version in the database, otherwise the write will be rejected as conflicting",
    "default": "",
    "required": false
  },
  {
    "displayName": "Is Deleted",
    "name": "object__item_data__variations__is_deleted",
    "type": "dropdown",
    "description": "give it is it deleted",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Name",
    "name": "object__item_data__variations__custom_attribute_values__value__name",
    "type": "string",
    "description": "The name of the custom attribute",
    "default": "",
    "required": false
  },
  {
    "displayName": "Number Value",
    "name": "object__item_data__variations__custom_attribute_values__number_value",
    "type": "string",
    "description": "Populated if type = NUMBER. Contains a string representation of a decimal number, using a . as the decimal separator",
    "default": "",
    "required": false
  },
  {
    "displayName": "Boolean Value",
    "name": "object__item_data__variations__custom_attribute_values__boolean_value",
    "type": "dropdown",
    "description": "A true or false value",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Catalog V1 ID",
    "name": "object__item_data__variations__custom_attribute_values__catalog_v1_ids__item__catalog_v1_id",
    "type": "string",
    "description": "The ID for an object used in the Square API V1, if the object ID differs from the Square API V2 object ID",
    "default": "",
    "required": false
  },
  {
    "displayName": "Location ID",
    "name": "object__item_data__variations__custom_attribute_values__catalog_v1_ids__item__location_id",
    "type": "string",
    "description": "The ID of the Location this Connect V1 ID is associated with",
    "default": "",
    "required": false
  },
  {
    "displayName": "Item ID",
    "name": "object__item_data__variations__item_variation_data__item_id",
    "type": "string",
    "description": "The ID of the catlogitem associated with this item variation",
    "default": "",
    "required": false
  },
  {
    "displayName": "Name",
    "name": "object__item_data__variations__item_variation_data__name",
    "type": "string",
    "description": "The item variation's name. This is a searchable attribute for use in applicable query filters. Its value has a maximum length of 255 Unicode code points. However, when the parent item uses item options, this attribute is auto-generated, read-only, and can be longer than 255 Unicode code points",
    "default": "",
    "required": false,
  },
  {
    "displayName": "SKU",
    "name": "object__item_data__variations__item_variation_data__sku",
    "type": "string",
    "description": "The item variation's SKU, if any. This is a searchable attribute for use in applicable query filters",
    "default": "",
    "required": false
  },
  {
    "displayName": "UPC",
    "name": "object__item_data__variations__item_variation_data__upc",
    "type": "string",
    "description": "The universal product code (UPC) of the item variation, if any. This is a searchable attribute for use in applicable query filters. The value of this attribute should be a number of 12-14 digits long",
    "default": "",
    "required": false
  },
  {
    "displayName": "Pricing Type",
    "name": "object__item_data__variations__item_variation_data__pricing_type",
    "type": "string",
    "description": "Indicates whether the item variation's price is fixed or determined at the time of sale",
    "default": "",
    "required": false
  },
  {
    "displayName": "Amount",
    "name": "object__item_data__variations__item_variation_data__price_money__amount",
    "type": "integer",
    "description": "The amount of money",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "object__item_data__variations__item_variation_data__price_money__currency",
    "type": "string",
    "description": "The currency of the money",
    "default": "",
    "required": false
  },
  {
    "displayName": "Location ID",
    "name": "object__item_data__variations__item_variation_data__location_overrides__item__location_id",
    "type": "string",
    "description": "The ID of the location",
    "default": "",
    "required": false
  },
  {
    "displayName": "Amount",
    "name": "object__item_data__variations__item_variation_data__location_overrides__item__price_money__amount",
    "type": "integer",
    "description": "The amount of money",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "object__item_data__variations__item_variation_data__location_overrides__item__price_money__currency",
    "type": "string",
    "description": "The currency of the money",
    "default": "",
    "required": false
  },
  {
    "displayName": "Track Inventory",
    "name": "object__item_data__variations__item_variation_data__location_overrides__item__track_inventory",
    "type": "boolean",
    "description": "If true, inventory tracking is active for the variation at this location",
    "default": false,
    "required": false
  },
  {
    "displayName": "Inventory Alert Type",
    "name": "object__item_data__variations__item_variation_data__location_overrides__item__inventory_alert_type",
    "type": "string",
    "description": "Indicates whether the item variation displays an alert when its inventory quantity is less than or equal to its inventory_alert_threshold",
    "default": "",
    "required": false
  },
  {
    "displayName": "Inventory Alert Threshold",
    "name": "object__item_data__variations__item_variation_data__location_overrides__item__inventory_alert_threshold",
    "type": "integer",
    "description": "If the inventory quantity for the variation is less than or equal to this value and inventory_alert_type is LOW_QUANTITY, the variation displays an alert in the merchant dashboard",
    "default": "",
    "required": false

  },
  {
    "displayName": "Track Inventory",
    "name": "object__item_data__variations__item_variation_data__track_inventory",
    "type": "dropdown",
    "description": "If true, inventory tracking is active for the variation",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Inventory Alert Type",
    "name": "object__item_data__variations__item_variation_data__inventory_alert_type",
    "type": "string",
    "description": "Indicates whether the item variation displays an alert when its inventory quantity is less than or equal to its inventory_alert_threshold",
    "default": "",
    "required": false
  },
  {
    "displayName": "Inventory Alert Threshold",
    "name": "object__item_data__variations__item_variation_data__inventory_alert_threshold",
    "type": "integer",
    "description": "If the inventory quantity for the variation is less than or equal to this value and inventory_alert_type is LOW_QUANTITY, the variation displays an alert in the merchant dashboard",
    "default": "",
    "required": false
  },
  {
    "displayName": "User Data",
    "name": "object__item_data__variations__item_variation_data__user_data",
    "type": "string",
    "description": "Arbitrary user metadata to associate with the item variation. This attribute value length is of Unicode code points",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Service Duration",
    "name": "object__item_data__variations__item_variation_data__service_duration",
    "type": "integer",
    "description": "If the catlogitem that owns this item variation is of type APPOINTMENTS_SERVICE, then this is the duration of the service in milliseconds",
    "default": "",
    "required": false
  },
  {
    "displayName": "Available for Booking",
    "name": "item_variation_data__available_for_booking",
    "type": "boolean",
    "description": "Beta If the catlogitem that owns this item variation is of type APPOINTMENTS_SERVICE, a bool representing whether this service is available for booking",
    "default": false,
    "required": false
  },

  {
    "displayName": "Item Option ID",
    "name": "item_variation_data__item_option_values__item__item_option_id",
    "type": "string",
    "description": "The ID of the item option",
    "default": "",
    "required": false
  },
  {
    "displayName": "Item Option Value ID",
    "name": "item_variation_data__item_option_values__item__item_option_value_id",
    "type": "string",
    "description": "The ID of the item option value",
    "default": "",
    "required": false
  },
  {
    "displayName": "Measurement Unit ID",
    "name": "object__item_data__variations__item_variation_data__measurement_unit_id",
    "type": "string",
    "description": "ID of the ‘CatalogMeasurementUnit’ that is used to measure the quantity sold of this item variation. If left unset, the item will be sold in whole quantities",
    "default": "",
    "required": false
  },
  {
    "displayName": "Sellable",
    "name": "object__item_data__variations__item_variation_data__sellable",
    "type": "dropdown",
    "description": "Beta Whether this variation can be sold. The inventory count of a sellable variation indicates the number of units available for sale. When a variation is both stockable and sellable, its sellable inventory count can be smaller than or equal to its stockable count",
    "default": "",
    "required": false
  },
  {
    "displayName": "Stockable",
    "name": "object__item_data__variations__item_variation_data__stockable",
    "type": "dropdown",
    "description": "Beta Whether stock is counted directly on this variation (TRUE) or only on its components (FALSE). When a variation is both stockable and sellable, the inventory count of a stockable variation keeps track of the number of units of this variation in stock and is not an indicator of the number of units of the variation that can be sold",
    "default": "",
    "required": false
  },
  {
    "displayName": "Image IDs",
    "name": "object__item_data__variations__item_variation_data__image_ids",
    "type": "string",
    "description": "The IDs of images associated with this catlogitemVariation instance. These images will be shown to customers in Square Online Store",
    "default": "",
    "required": false
  },
  {
    "displayName": "Name",
    "name": "object__name",
    "type": "string",
    "description": "The tax's name. This is a searchable attribute for use in applicable query filters, and its value length is of Unicode code points",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Calculation Phase",
    "name": "object__calculation_phase",
    "type": "string",
    "description": "Whether the tax is calculated based on a payment's subtotal or total",
    "default": "",
    "required": false
  },
  {
    "displayName": "Inclusion Type",
    "name": "object__inclusion_type",
    "type": "string",
    "description": "Whether the tax is ADDITIVE or INCLUSIVE",
    "default": "",
    "required": false
  },
  {
    "displayName": "Percentage",
    "name": "object__percentage",
    "type": "string",
    "description": "The percentage of the tax in decimal form, using a '.' as the decimal separator and without a '%' sign. A value of 7.5 corresponds to 7.5%. For a location-specific tax rate, contact the tax authority of the location or a tax consultant",
    "default": "",
    "required": false
  },
  {
    "displayName": "Applies to Custom Amounts",
    "name": "object__applies_to_custom_amounts",
    "type": "dropdown",
    "description": "If true, the fee applies to custom amounts entered into the Square Point of Sale app that are not associated with a particular catlogitem",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Enabled",
    "name": "object__enabled",
    "type": "dropdown",
    "description": "A Boolean flag to indicate whether the tax is displayed as enabled (true) in the Square Point of Sale app or not (false)",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Applies to Product Set ID",
    "name": "object__applies_to_product_set_id",
    "type": "string",
    "description": "Beta The ID of a CatalogProductSet object. If set, the tax is applicable to all products in the product set",
    "default": "",
    "required": false
  },
  {
    "displayName": "Name",
    "name": "object__discount_data__name",
    "type": "string",
    "description": "The discount name. This is a searchable attribute for use in applicable query filters, and its value length is of Unicode code points",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Discount Type",
    "name": "object__discount_data__discount_type",
    "type": "string",
    "description": "Indicates whether the discount is a fixed amount or percentage, or entered at the time of sale",
    "default": "",
    "required": false,
    "options": [
      { name: "FIXED_PERCENTAGE", value: "FIXED_PERCENTAGE" },
      { name: "FIXED_AMOUNT", value: "FIXED_AMOUNT" },
      { name: "VARIABLE_PERCENTAGE", value: "VARIABLE_PERCENTAGE" },
      { name: "VARIABLE_AMOUNT", value: "VARIABLE_AMOUNT" }
    ]
  },
  {
    "displayName": "Percentage",
    "name": "object__discount_data__percentage",
    "type": "string",
    "description": "The percentage of the discount as a string representation of a decimal number, using a . as the decimal separator and without a % sign. A value of 7.5 corresponds to 7.5%. Specify a percentage of 0 if discount_type is VARIABLE_PERCENTAGE. Do not use this field for amount-based or variable discounts",
    "default": "",
    "required": false
  },
  {
    "displayName": "Amount",
    "name": "object__discount_data__amount_money__amount",
    "type": "integer",
    "description": "The amount of money, in the smallest denomination of the currency indicated by currency. For example, when currency is USD, amount is in cents. Monetary amounts can be positive or negative. See the specific field description to determine the meaning of the sign in a particular case",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "object__discount_data__amount_money__currency",
    "type": "string",
    "description": "The type of currency, in ISO 4217 format. For example, the currency code for US dollars is USD",
    "default": "",
    "required": false,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ]
  },
  {
    "displayName": "Time Period Data Event",
    "name": "object__time_period_data__Event",
    "type": "string",
    "description": "Structured data for a CatalogTimePeriod, set for CatalogObjects of type TIME_PERIOD",
    "default": "",
    "required": false
  },
  {
    "displayName": "Name",
    "name": "object__pricing_rule_data__name",
    "type": "string",
    "description": "User-defined name for the pricing rule. For example, 'Buy one get one free' or '10% off'",
    "default": "",
    "required": false
  },
  {
    "displayName": "Time Period IDs",
    "name": "object__pricing_rule_data__time_period_ids",
    "type": "array of strings",
    "description": "A list of unique IDs for the catalog time periods when this pricing rule is in effect. If left unset, the pricing rule is always in effect",
    "default": "",
    "required": false
  },
  {
    "displayName": "Discount ID",
    "name": "object__pricing_rule_data__discount_id",
    "type": "string",
    "description": "Unique ID for the CatalogDiscount to take off the price of all matched items",
    "default": "",
    "required": false
  },
  {
    "displayName": "Match Products ID",
    "name": "object__pricing_rule_data__match_products_id",
    "type": "string",
    "description": "Unique ID for the CatalogProductSet that will be matched by this rule. A match rule matches within the entire cart, and can match multiple times. This field will always be set",
    "default": "",
    "required": false
  },
  {
    "displayName": "Exclude Products ID",
    "name": "object__pricing_rule_data__exclude_products_id",
    "type": "string",
    "description": "CatalogProductSet to exclude from the pricing rule. An exclude rule matches within the subset of the cart that fits the match rules (the match set). An exclude rule can only match once in the match set. If not supplied, the pricing will be applied to all products in the match set. Other products retain their base price, or a price generated by other rules",
    "default": "",
    "required": false
  },
  {
    "displayName": "Valid From Date",
    "name": "object__pricing_rule_data__valid_from_date",
    "type": "string",
    "description": "Represents the date the Pricing Rule is valid from. Represented in RFC 3339 full-date format (YYYY-MM-DD)",
    "default": "",
    "required": false
  },
  {
    "displayName": "Valid From Local Time",
    "name": "object__pricing_rule_data__valid_from_local_time",
    "type": "string",
    "description": "Represents the local time the pricing rule should be valid from. Represented in RFC 3339 partial-time format (HH:MM:SS). Partial seconds will be truncated",
    "default": "",
    "required": false
  },
  {
    "displayName": "Valid Until Date",
    "name": "object__pricing_rule_data__valid_until_date",
    "type": "string",
    "description": "Represents the date the Pricing Rule is valid until. Represented in RFC 3339 full-date format (YYYY-MM-DD)",
    "default": "",
    "required": false
  },
  {
    "displayName": "Valid Until Local Time",
    "name": "object__pricing_rule_data__valid_until_local_time",
    "type": "string",
    "description": "Represents the local time the pricing rule should be valid until. Represented in RFC 3339 partial-time format (HH:MM:SS). Partial seconds will be truncated",
    "default": "",
    "required": false
  },
  {
    "displayName": "Exclude Strategy",
    "name": "object__pricing_rule_data__exclude_strategy",
    "type": "string",
    "description": "If an exclude_products_id was given, controls which subset of matched products is excluded from any discounts",
    "default": "LEAST_EXPENSIVE",
    "required": false,
    "options": [
      { name: "LEAST_EXPENSIVE", value: "LEAST_EXPENSIVE" }
    ]
  },
  {
    "displayName": "Amount",
    "name": "object__pricing_rule_data__minimum_order_subtotal_money__amount",
    "type": "integer",
    "description": "The amount of money, in the smallest denomination of the currency indicated by currency. For example, when currency is USD, amount is in cents. Monetary amounts can be positive or negative. See the specific field description to determine the meaning of the sign in a particular case",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "object__pricing_rule_data__minimum_order_subtotal_money__currency",
    "type": "dropdown",
    "description": "The type of currency, in ISO 4217 format. For example, the currency code for US dollars is USD",
    "default": "",
    "required": false,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ]
  },
  {
    "displayName": "Customer Group IDs Any",
    "name": "object__pricing_rule_data__customer_group_ids_any",
    "type": "array of strings",
    "description": "A list of IDs of customer groups, the members of which are eligible for discounts specified in this pricing rule",
    "default": [],
    "required": false
  },
  {
    "displayName": "Subscription Name",
    "name": "object__subscription_plan_variation_data__name",
    "type": "string",
    "description": "The name of the plan variation",
    "default": "",
    "required": true
  },
  {
    "displayName": "UID",
    "name": "object__subscription_plan_variation_data__phases__item__uid",
    "type": "string",
    "description": "The Square-assigned ID of the subscription phase. This field cannot be changed after a SubscriptionPhase is created",
    "default": "",
    "required": false
  },
  {
    "displayName": "Cadence",
    "name": "object__subscription_plan_variation_data__phases__item__cadence",
    "type": "string",
    "description": "The billing cadence of the phase. For example, weekly or monthly. This field cannot be changed after a SubscriptionPhase is created",
    "default": "",
    "required": true
  },
  {
    "displayName": "Periods",
    "name": "object__subscription_plan_variation_data__phases__item__periods",
    "type": "integer",
    "description": "The number of cadences the phase lasts. If not set, the phase never ends. Only the last phase can be indefinite. This field cannot be changed after a SubscriptionPhase is created",
    "default": "",
    "required": false
  },
  {
    "displayName": "Amount",
    "name": "object__subscription_plan_variation_data__phases__item__recurring_price_money__amount",
    "type": "integer",
    "description": "The amount of money, in the smallest denomination of the currency indicated by currency. For example, when currency is USD, amount is in cents. Monetary amounts can be positive or negative. See the specific field description to determine the meaning of the sign in a particular case",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "object__subscription_plan_variation_data__phases__item__recurring_price_money__currency",
    "type": "string",
    "description": "The type of currency, in ISO 4217 format. For example, the currency code for US dollars is USD",
    "default": "",
    "required": false,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ]
  },
  {
    "displayName": "Ordinal",
    "name": "object__subscription_plan_variation_data__phases__item__ordinal",
    "type": "integer",
    "description": "The position this phase appears in the sequence of phases defined for the plan, indexed from 0. This field cannot be changed after a SubscriptionPhase is created",
    "default": "",
    "required": false
  },
  {
    "displayName": "Subscription Plan ID",
    "name": "object__subscription_plan_variation_data__phases__item__pricing__subscription_plan_id",
    "type": "string",
    "description": "The id of the subscription plan, if there is one",
    "default": "",
    "required": false
  },
  {
    "displayName": "Monthly Billing Anchor Date",
    "name": "object__subscription_plan_variation_data__phases__item__pricing__monthly_billing_anchor_date",
    "type": "integer",
    "description": "The day of the month the billing period starts",
    "default": "",
    "required": false
  },
  {
    "displayName": "Can Prorate",
    "name": "object__subscription_plan_variation_data__phases__item__pricing__can_prorate",
    "type": "dropdown",
    "description": "Whether bills for this plan variation can be split for proration",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" }
    ]
  },
  {
    "displayName": "Successor Plan Variation ID",
    "name": "object__subscription_plan_variation_data__phases__item__pricing__successor_plan_variation_id",
    "type": "string",
    "description": "The ID of a 'successor' plan variation to this one",
    "default": "",
    "required": false
  },
]

const getManyCatalog = [
  {
    "displayName": "Cursor",
    "name": "cursor",
    "type": "string",
    "description": "The pagination cursor returned in the previous response. Leave unset for an initial request. The page size is currently set to be 100. See Pagination for more information",
    "default": "",
    "required": false
  },
  {
    "displayName": "Types",
    "name": "types",
    "type": "string",
    "description": "An optional case-insensitive, comma-separated list of object types to retrieve. The valid values are defined in the CatalogObjectType enum, for example, ITEM, ITEM_VARIATION, CATEGORY, DISCOUNT, TAX, MODIFIER, MODIFIER_LIST, IMAGE, etc. If this is unspecified, the operation returns objects of all the top level types at the version of the Square API used to make the request. Object types that are nested onto other object types are not included in the defaults",
    "default": "",
    "required": false
  },
  {
    "displayName": "Catalog Version",
    "name": "catalog_version",
    "type": "integer",
    "description": "Beta The specific version of the catalog objects to be included in the response. This allows you to retrieve historical versions of objects. The specified version value is matched against the CatalogObjects' version attribute. If not included, results will be from the current version of the catalog",
    "default": "",
    "required": false
  }
]

//Payments
const createPayment = [
  {
    "displayName": "Tip MoneyAmount",
    "name": "tip_money__amount",
    "type": "integer",
    "description": "The amount of money in the smallest denomination of the applicable currency (e.g., cents for USD).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Tip Money Currency",
    "name": "tip_money__currency",
    "type": "string",
    "description": "The type of currency, in ISO 4217 format (e.g., USD for US dollars).",
    "default": "",
    "required": false
  },
  {
    "displayName": "App Fee Amount",
    "name": "app_fee_money__amount",
    "type": "integer",
    "description": "The amount of money, in the smallest denomination of the currency indicated by currency (e.g., cents for USD).",
    "default": "",
    "required": false
  },
  {
    "displayName": "App Fee Currency",
    "name": "app_fee_money__currency",
    "type": "string",
    "description": "The type of currency, in ISO 4217 format (e.g., USD for US dollars).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Delay Duration",
    "name": "delay_duration",
    "type": "string",
    "description": "The duration of time after the payment's creation when Square automatically either completes or cancels the payment depending on the delay_action field value.",
    "default": "P7D",
    "required": false
  },
  {
    "displayName": "Delay Action",
    "name": "delay_action",
    "type": "string",
    "description": "The action to be applied to the payment when the delay_duration has elapsed. The action must be CANCEL or COMPLETE.",
    "default": "CANCEL",
    "required": false
  },
  {
    "displayName": "Autocomplete",
    "name": "autocomplete",
    "type": "dropdown",
    "description": "If set to true, this payment will be completed when possible. If set to false, this payment is held until explicitly completed or canceled.",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Order ID",
    "name": "order_id",
    "type": "string",
    "description": "Associates a previously created order with this payment.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Team Member ID",
    "name": "team_member_id",
    "type": "string",
    "description": "An optional TeamMember ID to associate with this payment.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Verification Token",
    "name": "verification_token",
    "type": "string",
    "description": "An identifying token generated by payments.verifyBuyer() to verify the buyer's identity.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Accept Partial Authorization",
    "name": "accept_partial_authorization",
    "type": "dropdown",
    "description": "If set to true, a Square Gift Card payment might return a partial amount if the card balance is insufficient. Cannot be true when autocomplete = true.",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Buyer Email Address",
    "name": "buyer_email_address",
    "type": "string",
    "description": "The buyer's email address.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Buyer Phone Number",
    "name": "buyer_phone_number",
    "type": "string",
    "description": "The buyer's phone number, following a specific format with country code and special characters allowed.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Statement Description Identifier",
    "name": "statement_description_identifier",
    "type": "string",
    "description": "Optional additional payment information to include on the customer's card statement as part of the statement description. This can be an invoice number, ticket number, or short description that uniquely identifies the purchase.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Amount",
    "name": "cash_details__buyer_supplied_money__amount",
    "type": "integer",
    "description": "The amount of money, in the smallest denomination of the applicable currency (e.g., cents for USD).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "cash_details__buyer_supplied_money__currency",
    "type": "string",
    "description": "The type of currency, in ISO 4217 format (e.g., USD for US dollars).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Type",
    "name": "external_details__type",
    "type": "dropdown",
    "description": "The type of external payment the seller received.",
    "default": "",
    "required": false,
    options: [
      { name: "Paid using a physical check.", value: "CHECK" },
      { name: "Paid using external bank transfer.", value: "BANK_TRANSFER" },
      { name: "Paid using a non-Square gift card.", value: "OTHER_GIFT_CARD" },
      { name: "Paid using a crypto currency.", value: "CRYPTO" },
      { name: "Paid using Square Cash App.", value: "SQUARE_CASH" },
      { name: "Paid using peer-to-peer payment applications.", value: "SOCIAL" },
      { name: "A third-party application gathered this payment outside of Square.", value: "EXTERNAL" },
      { name: "Paid using an E-money provider.", value: "EMONEY" },
      { name: "A credit or debit card that Square does not support.", value: "CARD" },
      { name: "Use for house accounts, store credit, and so forth.", value: "STORED_BALANCE" },
      { name: "Restaurant voucher provided by employers to employees to pay for meals", value: "FOOD_VOUCHER" },
      { name: "A type not listed here.", value: "OTHER" }
    ]
  },
  {
    "displayName": "Source",
    "name": "external_details__source",
    "type": "string",
    "description": "A description of the external payment source.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Amount",
    "name": "external_details__source_fee_money__amount",
    "type": "integer",
    "description": "The amount of money in the smallest denomination of the applicable currency.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "external_details__source_fee_money__currency",
    "type": "string",
    "description": "The type of currency for the source fee.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Customer Initiated",
    "name": "customer_details__customer_initiated",
    "type": "boolean",
    "description": "Indicates whether the customer initiated the payment.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Seller Keyed In",
    "name": "customer_details__seller_keyed_in",
    "type": "boolean",
    "description": "Indicates whether the seller keyed in payment details on behalf of the customer.",
    "default": "",
    "required": false
  }

]

const createPaymentRefund = [
  {
    "displayName": "Amount",
    "name": "app_fee_money__amount",
    "type": "integer",
    "description": "The amount of money, in the smallest denomination of the currency (e.g., cents for USD).",
    "default": 0,
    "required": true
  },
  {
    "displayName": "Currency",
    "name": "app_fee_money__currency",
    "type": "dropdown",
    "description": "The currency code in ISO 4217 format (e.g., USD).",
    "default": "",
    "required": false,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ]
  },
  {
    "displayName": "Payment ID",
    "name": "payment_id",
    "type": "string",
    "description": "The ID of the payment being refunded. Required when unlinked=false.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Destination ID",
    "name": "destination_id",
    "type": "string",
    "description": "The ID indicating where funds will be refunded. Required for unlinked refunds.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Unlinked",
    "name": "unlinked",
    "type": "dropdown",
    "description": "Indicates if the refund is not linked to a Square payment. Requires destination_id and location_id if true.",
    "default": "",
    "required": false,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ]
  },
  {
    "displayName": "Location ID",
    "name": "location_id",
    "type": "string",
    "description": "The location ID for an unlinked refund. Required if unlinked=true.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Customer ID",
    "name": "customer_id",
    "type": "string",
    "description": "The Customer ID associated with the refund. Required if destination_id is a card on file (only when unlinked=true).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Payment Version Token",
    "name": "payment_version_token",
    "type": "string",
    "description": "Token used for optimistic concurrency. If it doesn't match the current version, the update fails with VERSION_MISMATCH.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Team Member ID",
    "name": "team_member_id",
    "type": "string",
    "description": "Optional ID of the team member associated with this refund.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Buyer Supplied Money - Amount",
    "name": "cash_details__buyer_supplied_money__amount",
    "type": "integer",
    "description": "Amount provided by buyer in the smallest denomination (e.g., cents for USD).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Buyer Supplied Money - Currency",
    "name": "cash_details__buyer_supplied_money__currency",
    "type": "dropdown",
    "description": "Currency in ISO 4217 format (e.g., USD).",
    "default": "",
    "required": false,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ]
  },
  {
    "displayName": "Type",
    "name": "external_details__type",
    "type": "string",
    "description": "Type of external payment (e.g., CHECK, CRYPTO, BANK_TRANSFER).",
    "default": "",
    "required": false,
    options: [
      { name: "Paid using a physical check.", value: "CHECK" },
      { name: "Paid using external bank transfer.", value: "BANK_TRANSFER" },
      { name: "Paid using a non-Square gift card.", value: "OTHER_GIFT_CARD" },
      { name: "Paid using a crypto currency.", value: "CRYPTO" },
      { name: "Paid using Square Cash App.", value: "SQUARE_CASH" },
      { name: "Paid using peer-to-peer payment applications.", value: "SOCIAL" },
      { name: "A third-party application gathered this payment outside of Square.", value: "EXTERNAL" },
      { name: "Paid using an E-money provider.", value: "EMONEY" },
      { name: "A credit or debit card that Square does not support.", value: "CARD" },
      { name: "Use for house accounts, store credit, and so forth.", value: "STORED_BALANCE" },
      { name: "Restaurant voucher provided by employers to employees to pay for meals", value: "FOOD_VOUCHER" },
      { name: "A type not listed here.", value: "OTHER" }
    ]
  },
  {
    "displayName": "Source",
    "name": "external_details__source",
    "type": "string",
    "description": "A short description of the external payment source (e.g., 'Food Delivery Service').",
    "default": "",
    "required": false,
  }
]

const getManyPaymentsRefund = [
  {
    "displayName": "Begin Time",
    "name": "begin_time",
    "type": "string",
    "description": "Start of the created_at time range in RFC 3339 format. Default is one year ago.",
    "default": "",
    "required": false
  },
  {
    "displayName": "End Time",
    "name": "end_time",
    "type": "string",
    "description": "End of the created_at time range in RFC 3339 format. Default is the current time.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Sort Order",
    "name": "sort_order",
    "type": "dropdown",
    "description": "The order in which results are listed by created_at.",
    "default": "",
    "required": false,
    "options": [
      { "name": "Oldest to Newest (ASC)", "value": "ASC" },
      { "name": "Newest to Oldest (DESC)", "value": "DESC" }
    ]
  },
  {
    "displayName": "Cursor",
    "name": "cursor",
    "type": "string",
    "description": "Pagination cursor to retrieve the next set of results from a previous query.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Location ID",
    "name": "location_id",
    "type": "string",
    "description": "Limit results to this location. Defaults to all seller locations.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Refund Status",
    "name": "status",
    "type": "string",
    "description": "Filter refunds by status. If omitted, returns all statuses.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Source Type",
    "name": "source_type",
    "type": "dropdown",
    "description": "Filter refunds based on payment source type.",
    "default": "",
    "required": false,
    "options": [
      { "name": "Card", "value": "CARD" },
      { "name": "Bank Account", "value": "BANK_ACCOUNT" },
      { "name": "Wallet", "value": "WALLET" },
      { "name": "Cash", "value": "CASH" },
      { "name": "External", "value": "EXTERNAL" }
    ]
  },
  {
    "displayName": "Limit",
    "name": "limit",
    "type": "integer",
    "description": "Maximum number of results per page (max 100).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Updated At Begin Time",
    "name": "updated_at_begin_time",
    "type": "date",
    "description": "Start of the updated_at time range in RFC 3339 format.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Updated At End Time",
    "name": "updated_at_end_time",
    "type": "date",
    "description": "End of the updated_at time range in RFC 3339 format.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Sort Field",
    "name": "sort_field",
    "type": "dropdown",
    "description": "The field to sort by. Default is CREATED_AT.",
    "default": "",
    "required": false,
    "options": [
      { "name": "Created At", "value": "CREATED_AT" },
      { "name": "Updated At", "value": "UPDATED_AT" }
    ]
  }
]

//orders
const createOrder = [
  {
    "displayName": "Reference ID",
    "name": "order__reference_id",
    "type": "string",
    "description": "A client-specified ID to associate an entity in another system with this order.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Source Name",
    "name": "order__source__name",
    "type": "string",
    "description": "Origination details of the order.",
    "default": "",
    "required": false,

  },
  {
    "displayName": "Customer ID",
    "name": "order__customer_id",
    "type": "string",
    "description": "The ID of the customer associated with the order. Helps link transactions reliably to customer profiles.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Note",
    "name": "order__note",
    "type": "string",
    "description": "An optional note associated with the line item.",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Catalog Object ID",
    "name": "order__catalog_object_id",
    "type": "string",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Catalog Version",
    "name": "order__catalog_version",
    "type": "number",
    "default": "",
    "required": false
  },
  {
    "displayName": "Variation Name",
    "name": "order__variation_name",
    "type": "string",
    "default": "",
    "required": false,
  },
  {
    "displayName": "Item Type",
    "name": "order__item_type",
    "type": "dropdown",
    "default": "",
    "required": false,
    "options": [
      { "name": "ITEM", "value": "ITEM" },
      { "name": "CUSTOM", "value": "CUSTOM" },
      { "name": "GIFT_CARD", "value": "GIFT_CARD" }
    ]
  },
  {
    "displayName": "Tax UID",
    "name": "order__taxes||uid",
    "type": "string",
    "description": "A unique ID that identifies the tax only within this order.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Catalog Object ID",
    "name": "order__taxes||catalog_object_id",
    "type": "string",
    "description": "The catalog object ID referencing CatalogTax.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Catalog Version",
    "name": "order__taxes||catalog_version",
    "type": "integer",
    "description": "The version of the catalog object that this tax references.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Tax Name",
    "name": "order__taxes||name",
    "type": "string",
    "description": "The name of the tax.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Tax Type",
    "name": "order__taxes||type",
    "type": "string",
    "description": "Indicates the calculation method used to apply the tax.",
    "default": "",
    "required": false,
    options: [
      { name: "Used for reporting only. The original transaction discount scope is currently not supported by the API.", value: "OTHER_DISCOUNT_SCOPE" },
      { name: "The discount should be applied to only line items specified by OrderLineItemAppliedDiscount reference records.", value: "LINE_ITEM" },
      { name: "The discount should be applied to the entire order.", value: "ORDER" }
    ]
  },
  {
    "displayName": "Tax Percentage",
    "name": "order__taxes||percentage",
    "type": "string",
    "description": "The percentage of the tax, as a string representation of a decimal number.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Metadata",
    "name": "order__taxes||metadata",
    "type": "map",
    "description": "Application-defined data attached to this tax. It is used to store descriptive references or associations with an entity in another system.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Applied Money Amount",
    "name": "order__taxes||applied_money__amount",
    "type": "integer",
    "description": "The amount of money applied to the order by the tax.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Applied Money Currency",
    "name": "order__taxes||applied_money__currency",
    "type": "string",
    "description": "The currency used for the applied money.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Tax Scope",
    "name": "order__taxes||scope",
    "type": "string",
    "description": "Indicates the level at which the tax applies. Scope can be ORDER or LINE_ITEM.",
    "default": "",
    "required": false,
    options: [
      { name: "Used for reporting only. The original transaction discount scope is currently not supported by the API.", value: "OTHER_DISCOUNT_SCOPE" },
      { name: "The discount should be applied to only line items specified by OrderLineItemAppliedDiscount reference records.", value: "LINE_ITEM" },
      { name: "The discount should be applied to the entire order.", value: "ORDER" }
    ]
  },
  {
    "displayName": "Discount UID",
    "name": "order__discounts||uid",
    "type": "string",
    "description": "A unique ID that identifies the discount only within this order.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Catalog Object ID",
    "name": "order__discounts||catalog_object_id",
    "type": "string",
    "description": "The catalog object ID referencing CatalogDiscount.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Catalog Version",
    "name": "order__discounts||catalog_version",
    "type": "integer",
    "description": "The version of the catalog object that this discount references.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Discount Name",
    "name": "order__discounts||name",
    "type": "string",
    "description": "The name of the discount.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Discount Type",
    "name": "order__discounts||type",
    "type": "string",
    "description": "The type of the discount (e.g., FIXED_PERCENTAGE, FIXED_AMOUNT).",
    "default": "",
    "required": false,
    options: [
      { name: "Used for reporting only. The original transaction discount type is currently not supported by the API.", value: "UNKNOWN_DISCOUNT" },
      { name: "Apply the discount as a fixed percentage (such as 5%) off the item price.", value: "FIXED_PERCENTAGE" },
      { name: "Apply the discount as a fixed monetary value (such as $1.00) off the item price.", value: "FIXED_AMOUNT" },
      { name: "Apply the discount as a variable percentage based on the item price.\nThe specific discount percentage of a VARIABLE_PERCENTAGE discount is assigned at the time of the purchase.", value: "VARIABLE_PERCENTAGE" },
      { name: "Apply the discount as a variable amount based on the item price.\nThe specific discount amount of a VARIABLE_AMOUNT discount is assigned at the time of the purchase.", value: "VARIABLE_AMOUNT" }
    ]
  },
  {
    "displayName": "Discount Percentage",
    "name": "order__discounts||percentage",
    "type": "string",
    "description": "The percentage of the discount as a string representation of a decimal number.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Amount",
    "name": "order__discounts||amount_money__amount",
    "type": "integer",
    "description": "The amount of money in the smallest denomination of the currency (e.g., cents for USD).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "order__discounts||amount_money__currency",
    "type": "string",
    "description": "The currency type in ISO 4217 format (e.g., USD for US dollars).",
    "default": "",
    "required": false
  },
  {
    "displayName": "Amount",
    "name": "order__discounts||applied_money__amount",
    "type": "integer",
    "description": "The amount of money applied to the line item or order in the smallest denomination of the currency.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Currency",
    "name": "order__discounts||applied_money__currency",
    "type": "string",
    "description": "The currency type in ISO 4217 format for the applied discount.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Metadata",
    "name": "order__discounts||metadata",
    "type": "string",
    "description": "Application-defined data attached to this discount. It stores descriptive references or associations with an entity in another system.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Discount Scope",
    "name": "order__discounts||scope",
    "type": "string",
    "description": "Indicates the level at which the discount applies (ORDER or LINE_ITEM).",
    "default": "",
    "required": false,
    option: [
      { name: "Used for reporting only. The original transaction discount scope is currently not supported by the API.", value: "OTHER_DISCOUNT_SCOPE" },
      { name: "The discount should be applied to only line items specified by OrderLineItemAppliedDiscount reference records.", value: "LINE_ITEM" },
      { name: "The discount should be applied to the entire order.", value: "ORDER" }
    ]
  },
  {
    "displayName": "Applied Service Charges UID",
    "name": "order__applied_service_charges||service_charge_id",
    "type": "string",
    "description": "Comma-separated list of service_charge_id values referencing the applied service charges.",
    "default": "",
    "required": false
  },
  {
    "displayName": "Applied Service Charges",
    "name": "order__applied_service_charges",
    "type": "string",
    "description": "Comma-separated list of service_charge_id referencing applied service charges.",
    "default": "",
    "required": false
  }
]







export const fields = [

  // customer
  {
    displayName: "Given Name",
    name: "given_name",
    type: "string",
    description: "Customer's first name",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Family Name",
    name: "family_name",
    type: "string",
    description: "Customer's last name",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Email Address",
    name: "email_address",
    type: "email",
    description: "Customer's email address",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Phone Number",
    name: "phone_number",
    type: "string",
    description: "Customer's phone number",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Address",
    name: "address",
    type: "collection",
    description: "Customer's address",
    default: "",
    item: [],
    required: true,
    fields: [
      {
        displayName: "Address Line 1",
        name: "address_addressline1",
        type: "string",
        default: "",
        required: true
      },
      {
        displayName: "Address Line 2",
        name: "address__addressline2",
        type: "string",
        default: "",
        required: true
      },
      {
        displayName: "City / Locality",
        name: "address__locality",
        type: "string",
        default: "",
        required: true
      },
      {
        displayName: "State / District",
        name: "address__administrativedistrictlevel1",
        type: "string",
        default: "",
        required: true
      },
      {
        displayName: "Postal Code",
        name: "address__postalcode",
        type: "string",
        default: "",
        required: true
      },
      {
        displayName: "Country",
        name: "address__country",
        type: "string",
        default: "",
        required: true,
        options: [
          { "name": "Unknown", "value": "ZZ" },
          { "name": "Andorra", "value": "AD" },
          { "name": "United Arab Emirates", "value": "AE" },
          { "name": "Afghanistan", "value": "AF" },
          { "name": "Antigua and Barbuda", "value": "AG" },
          { "name": "Anguilla", "value": "AI" },
          { "name": "Albania", "value": "AL" },
          { "name": "Armenia", "value": "AM" },
          { "name": "Angola", "value": "AO" },
          { "name": "Antarctica", "value": "AQ" },
          { "name": "Argentina", "value": "AR" },
          { "name": "American Samoa", "value": "AS" },
          { "name": "Austria", "value": "AT" },
          { "name": "Australia", "value": "AU" },
          { "name": "Aruba", "value": "AW" },
          { "name": "Åland Islands", "value": "AX" },
          { "name": "Azerbaijan", "value": "AZ" },
          { "name": "Bosnia and Herzegovina", "value": "BA" },
          { "name": "Barbados", "value": "BB" },
          { "name": "Bangladesh", "value": "BD" },
          { "name": "Belgium", "value": "BE" },
          { "name": "Burkina Faso", "value": "BF" },
          { "name": "Bulgaria", "value": "BG" },
          { "name": "Bahrain", "value": "BH" },
          { "name": "Burundi", "value": "BI" },
          { "name": "Benin", "value": "BJ" },
          { "name": "Saint Barthélemy", "value": "BL" },
          { "name": "Bermuda", "value": "BM" },
          { "name": "Brunei", "value": "BN" },
          { "name": "Bolivia", "value": "BO" },
          { "name": "Bonaire", "value": "BQ" },
          { "name": "Brazil", "value": "BR" },
          { "name": "Bahamas", "value": "BS" },
          { "name": "Bhutan", "value": "BT" },
          { "name": "Bouvet Island", "value": "BV" },
          { "name": "Botswana", "value": "BW" },
          { "name": "Belarus", "value": "BY" },
          { "name": "Belize", "value": "BZ" },
          { "name": "Canada", "value": "CA" },
          { "name": "Cocos Islands", "value": "CC" },
          { "name": "Democratic Republic of the Congo", "value": "CD" },
          { "name": "Central African Republic", "value": "CF" },
          { "name": "Congo", "value": "CG" },
          { "name": "Switzerland", "value": "CH" },
          { "name": "Ivory Coast", "value": "CI" },
          { "name": "Cook Islands", "value": "CK" },
          { "name": "Chile", "value": "CL" },
          { "name": "Cameroon", "value": "CM" },
          { "name": "China", "value": "CN" },
          { "name": "Colombia", "value": "CO" }
        ]

      }
    ],
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["create", "update"]
      }
    }
  },

  {
    displayName: "Customer ID",
    name: "Id",
    type: "string",
    description: "Customer ID used to update or delete a specific customer",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["update", "delete"]
      }
    },
  },


  {
    displayName: "Customer ID",
    name: "Id",
    type: "string",
    description: "Customer ID to retrieve details",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["get"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["create", "update"],
      },
    },
    fields: customCreateFields
  },

  {
    displayName: "Where",
    name: "where",
    type: "filter",
    placeholder: "Specify the conditions to filter items",
    default: "",
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["customers"],
        name: ["getMany"],
      },
    },
    fields: getManyCustomers
  },



  // catlogitem
  {
    displayName: "Object Id",
    name: "object__id",
    type: "string",
    description: "The ID of the catalog object",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Object Type",
    name: "object__type",
    type: "dropdown",
    description: "The type of the catalog object (e.g., ITEM)",
    default: "",
    item: [],
    required: true,
    options: [
      { "name": "ITEM", "value": "ITEM" },
      { "name": "IMAGE", "value": "IMAGE" },
      { "name": "CATEGORY", "value": "CATEGORY" },
      { "name": "ITEM_VARIATION", "value": "ITEM_VARIATION" },
      { "name": "TAX", "value": "TAX" },
      { "name": "DISCOUNT", "value": "DISCOUNT" },
      { "name": "MODIFIER_LIST", "value": "MODIFIER_LIST" },
      { "name": "MODIFIER", "value": "MODIFIER" },
      { "name": "PRICING_RULE", "value": "PRICING_RULE" },
      { "name": "PRODUCT_SET", "value": "PRODUCT_SET" },
      { "name": "TIME_PERIOD", "value": "TIME_PERIOD" },
      { "name": "MEASUREMENT_UNIT", "value": "MEASUREMENT_UNIT" },
      { "name": "SUBSCRIPTION_PLAN_VARIATION", "value": "SUBSCRIPTION_PLAN_VARIATION" },
      { "name": "ITEM_OPTION", "value": "ITEM_OPTION" },
      { "name": "ITEM_OPTION_VAL", "value": "ITEM_OPTION_VAL" },
      { "name": "CUSTOM_ATTRIBUTE_DEFINITION", "value": "CUSTOM_ATTRIBUTE_DEFINITION" },
      { "name": "QUICK_AMOUNTS_SETTINGS", "value": "QUICK_AMOUNTS_SETTINGS" },
      { "name": "SUBSCRIPTION_PLAN", "value": "SUBSCRIPTION_PLAN" },
      { "name": "AVAILABILITY_PERIOD", "value": "AVAILABILITY_PERIOD" }
    ]
    ,
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Name",
    name: "object__item_data__name",
    type: "string",
    item: [],
    default: "",
    description: "Name of the item",
    required: true,
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Variation Id",
    name: "object__item__variations__id",
    type: "string",
    item: [],
    default: "",
    description: "Variation Id of the item",
    required: true,
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Variation Type",
    name: "object__item_variations__type",
    type: "dropdown",
    item: [],
    default: "",
    description: "Type of Variation",
    required: true,
    options: [
      { "name": "ITEM", "value": "ITEM" },
      { "name": "IMAGE", "value": "IMAGE" },
      { "name": "CATEGORY", "value": "CATEGORY" },
      { "name": "ITEM_VARIATION", "value": "ITEM_VARIATION" },
      { "name": "TAX", "value": "TAX" },
      { "name": "DISCOUNT", "value": "DISCOUNT" },
      { "name": "MODIFIER_LIST", "value": "MODIFIER_LIST" },
      { "name": "MODIFIER", "value": "MODIFIER" },
      { "name": "PRICING_RULE", "value": "PRICING_RULE" },
      { "name": "PRODUCT_SET", "value": "PRODUCT_SET" },
      { "name": "TIME_PERIOD", "value": "TIME_PERIOD" },
      { "name": "MEASUREMENT_UNIT", "value": "MEASUREMENT_UNIT" },
      { "name": "SUBSCRIPTION_PLAN_VARIATION", "value": "SUBSCRIPTION_PLAN_VARIATION" },
      { "name": "ITEM_OPTION", "value": "ITEM_OPTION" },
      { "name": "ITEM_OPTION_VAL", "value": "ITEM_OPTION_VAL" },
      { "name": "CUSTOM_ATTRIBUTE_DEFINITION", "value": "CUSTOM_ATTRIBUTE_DEFINITION" },
      { "name": "QUICK_AMOUNTS_SETTINGS", "value": "QUICK_AMOUNTS_SETTINGS" },
      { "name": "SUBSCRIPTION_PLAN", "value": "SUBSCRIPTION_PLAN" },
      { "name": "AVAILABILITY_PERIOD", "value": "AVAILABILITY_PERIOD" }
    ],
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["create"],
      },
    },
    fields: createCatalog
  },

  // Get Catalog Item
  {
    displayName: "Object Id",
    name: "Id",
    type: "string",
    description: "ID of the catalog item",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["get", "delete"]
      }
    },
  },

  {
    displayName: "Where",
    name: "where",
    type: "filter",
    item: [],
    description: "Filter options for retrieving multiple catalog items",
    default: "",
    displayOptions: {
      show: {
        category: ["catlogitem"],
        name: ["getMany"]
      }
    },
    fields: getManyCatalog
  },



  //location
  {
    displayName: "Location Id",
    name: "Id",
    type: "string",
    description: "ID of the location to retrieve",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["locations"],
        name: ["get"]
      }
    }
  },

  //invoice
  {
    displayName: "Idempotency Key",
    name: "idempotency_key",
    type: "string",
    default: "",
    description: "Unique Key as you Give",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Location ID",
    name: "invoice__location_id",
    type: "spldropdown",
    default: "",
    description: "Unique Id of Location",
    item: [],
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllLocations(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Order ID",
    name: "invoice__order_id",
    type: "spldropdown",
    default: "",
    item: [],
    description: "Unique Id of Order",
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllOrders(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Customer ID",
    name: "invoice__primary_recipient__customer_id",
    type: "spldropdown",
    default: "",
    item: [],
    description: "Unique Id of Customer",
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllCustomers(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Delivery Method",
    name: "invoice__delivery_method",
    type: "string",
    default: "",
    item: [],
    description: "Method of delivery",
    required: true,
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Payment Requests Type",
    name: "invoice__payment_requests__request_type",
    type: "dropdown",
    default: "",
    item: [],
    description: "payment requests type",
    options: [
      { name: "BALANCE", value: "BALANCE" },
      { name: "DEPOSIT", value: "DEPOSIT" },
      { name: "INSTALLMENT", value: "INSTALLMENT" },
    ],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Payment Requests Type",
    name: "invoice__payment_requests__due_date",
    type: "date",
    default: "",
    item: [],
    description: " payment requests due date",
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Payment Requests Tripping Enable",
    name: "invoice__payment_requests__tipping_enabled",
    type: "dropdown",
    default: "",
    item: [],
    description: " payment requests Tripping",
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Payment Requests Payment Source",
    name: "invoice__payment_requests__automatic_payment_source",
    type: "dropdown",
    default: "",
    item: [],
    description: " payment requests Tripping",
    options: [
      { name: "NONE", value: "NONE" },
      { name: "CARD_ON_FILE", value: "CARD_ON_FILE" },
      { name: "BANK_ON_FILE", value: "BANK_ON_FILE" },
    ],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Invoice Number",
    name: "invoice__invoice_number",
    type: "string",
    description: "Unique Number of Invoice",
    default: "",
    item: [],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Title",
    name: "invoice__title",
    type: "string",
    description: "Title of invoice",
    default: "",
    item: [],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Description",
    name: "invoice__description",
    type: "string",
    description: "description of invoice",
    default: "",
    item: [],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"],
      },
    },
    fields: invoicecreateAdditionalFields
  },

  // Update Invoice
  {
    displayName: "Invoice ID",
    name: "Id",
    type: "string",
    description: "Unique Id of Invoice",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["update"]
      }
    }
  },
  {
    displayName: "Invoice Version",
    name: "invoice__version",
    type: "integer",
    description: "Version of invoice",
    default: "",
    item: [],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["update"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["create"],
      },
    },
    fields: invoiceUpdateAdditionalFields
  },

  // Publish Invoice
  {
    displayName: "Invoice ID",
    name: "Id",
    type: "string",
    description: "Unique Id of Invoice",
    default: "",
    item: [],
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllInvoices(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["invoicespublish"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Version",
    name: "version",
    type: "string",
    description: "Version of the invoice",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["invoicespublish"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Idempotency Key",
    name: "idempotency_key",
    type: "string",
    description: "Unique Key",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["invoicespublish"],
        name: ["create", "update"]
      }
    }
  },

  // Get Many Invoices
  {
    displayName: "Location ID",
    name: "Id",
    type: "spldropdown",
    description: "Id of the Location",
    default: "",
    item: [],
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllLocations(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["getMany"]
      }
    }
  },
  {
    displayName: "Where",
    name: "where",
    type: "filter",
    placeholder: "Specify the conditions to filter items",
    default: "",
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["invoices"],
        name: ["getMany"],
      },
    },
    fields: getManyInvoices
  },



  // Order
  {
    displayName: "Idempotency Key",
    name: "idempotency_key",
    type: "string",
    description: "Unique Key",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Location ID",
    name: "order__location_id",
    type: "spldropdown",
    description: "Unique Id of Location",
    default: "",
    item: [],
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllLocations(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "UID",
    name: "order__uid",
    type: "string",
    description: "Unique UID of Order",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Name",
    name: "order__Name",
    type: "string",
    description: "Name of order",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "  Quantity",
    name: "order__quantity",
    type: "string",
    description: " Order Quantity",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Base Price Money Amount",
    name: "order__base_price_money__amount",
    type: "string",
    description: "Price Amount",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Base Price Money Currency",
    name: "order__base_price_money__current",
    type: "dropdown",
    description: "Which Currency",
    default: "",
    item: [],
    required: true,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ],
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["create", "update"],
      },
    },
    fields: createOrder
  },



  // Get Order
  {
    displayName: "Order ID",
    name: "Id",
    type: "string",
    description: "Unique Id of Order",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["orders"],
        name: ["get"]
      }
    }
  },


  //payment
  {
    displayName: "Idempotency Key",
    name: "idempotency_key",
    type: "string",
    description: "Unique Key",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Billing Address",
    name: "address",
    type: "collection",
    description: "Customer's address",
    default: "",
    item: [],
    required: true,
    fields: [
      {
        displayName: "Address Line 1",
        name: "billing_addressaddressline1",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Address Line 2",
        name: "billing_address__addressline2",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Address Line 3",
        name: "billing_address__addressline2",
        type: "string",
        item: [],
        default: "",
        required: false
      },
      {
        displayName: "City / Locality",
        name: "billing_address__locality",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "State / District",
        name: "billing_address__administrativedistrictlevel1",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Postal Code",
        name: "billing_address__postalcode",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Country",
        name: "billing_address__country",
        type: "string",
        item: [],
        default: "",
        required: true,
        options: [
          { "name": "Unknown", "value": "ZZ" },
          { "name": "Andorra", "value": "AD" },
          { "name": "United Arab Emirates", "value": "AE" },
          { "name": "Afghanistan", "value": "AF" },
          { "name": "Antigua and Barbuda", "value": "AG" },
          { "name": "Anguilla", "value": "AI" },
          { "name": "Albania", "value": "AL" },
          { "name": "Armenia", "value": "AM" },
          { "name": "Angola", "value": "AO" },
          { "name": "Antarctica", "value": "AQ" },
          { "name": "Argentina", "value": "AR" },
          { "name": "American Samoa", "value": "AS" },
          { "name": "Austria", "value": "AT" },
          { "name": "Australia", "value": "AU" },
          { "name": "Aruba", "value": "AW" },
          { "name": "Åland Islands", "value": "AX" },
          { "name": "Azerbaijan", "value": "AZ" },
          { "name": "Bosnia and Herzegovina", "value": "BA" },
          { "name": "Barbados", "value": "BB" },
          { "name": "Bangladesh", "value": "BD" },
          { "name": "Belgium", "value": "BE" },
          { "name": "Burkina Faso", "value": "BF" },
          { "name": "Bulgaria", "value": "BG" },
          { "name": "Bahrain", "value": "BH" },
          { "name": "Burundi", "value": "BI" },
          { "name": "Benin", "value": "BJ" },
          { "name": "Saint Barthélemy", "value": "BL" },
          { "name": "Bermuda", "value": "BM" },
          { "name": "Brunei", "value": "BN" },
          { "name": "Bolivia", "value": "BO" },
          { "name": "Bonaire", "value": "BQ" },
          { "name": "Brazil", "value": "BR" },
          { "name": "Bahamas", "value": "BS" },
          { "name": "Bhutan", "value": "BT" },
          { "name": "Bouvet Island", "value": "BV" },
          { "name": "Botswana", "value": "BW" },
          { "name": "Belarus", "value": "BY" },
          { "name": "Belize", "value": "BZ" },
          { "name": "Canada", "value": "CA" },
          { "name": "Cocos Islands", "value": "CC" },
          { "name": "Democratic Republic of the Congo", "value": "CD" },
          { "name": "Central African Republic", "value": "CF" },
          { "name": "Congo", "value": "CG" },
          { "name": "Switzerland", "value": "CH" },
          { "name": "Ivory Coast", "value": "CI" },
          { "name": "Cook Islands", "value": "CK" },
          { "name": "Chile", "value": "CL" },
          { "name": "Cameroon", "value": "CM" },
          { "name": "China", "value": "CN" },
          { "name": "Colombia", "value": "CO" }
        ]
      },
      {
        displayName: "First Name",
        name: "billing_address__first_name",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Last Name",
        name: "billing_address__last_name",
        type: "string",
        item: [],
        default: "",
        required: true
      },
    ],
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Shipping Address",
    name: "address",
    type: "collection",
    description: "Customer's address",
    default: "",
    item: [],
    required: true,
    fields: [
      {
        displayName: "Address Line 1",
        name: "shipping_address__addressaddressline1",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Address Line 2",
        name: "shipping_address__addressline2",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Address Line 3",
        name: "shipping_address__addressline2",
        type: "string",
        item: [],
        default: "",
        required: false
      },
      {
        displayName: "City / Locality",
        name: "shipping_address__locality",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "State / District",
        name: "shipping_address__administrativedistrictlevel1",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Postal Code",
        name: "shipping_address__postalcode",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Country",
        name: "shipping_address__country",
        type: "string",
        item: [],
        default: "",
        required: true,
        options: [
          { "name": "Unknown", "value": "ZZ" },
          { "name": "Andorra", "value": "AD" },
          { "name": "United Arab Emirates", "value": "AE" },
          { "name": "Afghanistan", "value": "AF" },
          { "name": "Antigua and Barbuda", "value": "AG" },
          { "name": "Anguilla", "value": "AI" },
          { "name": "Albania", "value": "AL" },
          { "name": "Armenia", "value": "AM" },
          { "name": "Angola", "value": "AO" },
          { "name": "Antarctica", "value": "AQ" },
          { "name": "Argentina", "value": "AR" },
          { "name": "American Samoa", "value": "AS" },
          { "name": "Austria", "value": "AT" },
          { "name": "Australia", "value": "AU" },
          { "name": "Aruba", "value": "AW" },
          { "name": "Åland Islands", "value": "AX" },
          { "name": "Azerbaijan", "value": "AZ" },
          { "name": "Bosnia and Herzegovina", "value": "BA" },
          { "name": "Barbados", "value": "BB" },
          { "name": "Bangladesh", "value": "BD" },
          { "name": "Belgium", "value": "BE" },
          { "name": "Burkina Faso", "value": "BF" },
          { "name": "Bulgaria", "value": "BG" },
          { "name": "Bahrain", "value": "BH" },
          { "name": "Burundi", "value": "BI" },
          { "name": "Benin", "value": "BJ" },
          { "name": "Saint Barthélemy", "value": "BL" },
          { "name": "Bermuda", "value": "BM" },
          { "name": "Brunei", "value": "BN" },
          { "name": "Bolivia", "value": "BO" },
          { "name": "Bonaire", "value": "BQ" },
          { "name": "Brazil", "value": "BR" },
          { "name": "Bahamas", "value": "BS" },
          { "name": "Bhutan", "value": "BT" },
          { "name": "Bouvet Island", "value": "BV" },
          { "name": "Botswana", "value": "BW" },
          { "name": "Belarus", "value": "BY" },
          { "name": "Belize", "value": "BZ" },
          { "name": "Canada", "value": "CA" },
          { "name": "Cocos Islands", "value": "CC" },
          { "name": "Democratic Republic of the Congo", "value": "CD" },
          { "name": "Central African Republic", "value": "CF" },
          { "name": "Congo", "value": "CG" },
          { "name": "Switzerland", "value": "CH" },
          { "name": "Ivory Coast", "value": "CI" },
          { "name": "Cook Islands", "value": "CK" },
          { "name": "Chile", "value": "CL" },
          { "name": "Cameroon", "value": "CM" },
          { "name": "China", "value": "CN" },
          { "name": "Colombia", "value": "CO" }
        ]
      },
      {
        displayName: "First Name",
        name: "shipping_address__first_name",
        type: "string",
        item: [],
        default: "",
        required: true
      },
      {
        displayName: "Last Name",
        name: "shipping_address__last_name",
        type: "string",
        item: [],
        default: "",
        required: true
      },
    ],
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create", "update"]
      }
    }
  },
  {
    displayName: "Amount",
    name: "amount_money__amount",
    type: "integer",
    description: "Amount",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Currency",
    name: "amount_money__currency",
    type: "dropdown",
    description: "Which Currency",
    default: "",
    item: [],
    required: true,
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ],
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Source ID",
    name: "source_id",
    type: "string",
    description: "Unique Id of Source",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Location ID",
    name: "Id",
    type: "spldropdown",
    description: "Unique Id of Location",
    default: "",
    item: [],
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllLocations(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Note",
    name: "note",
    type: "string",
    description: "NOte for payment",
    default: "",
    item: [],
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Reference ID",
    name: "reference_id",
    type: "string",
    description: "Unique Id of Reference",
    default: "",
    item: [],
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Customer ID",
    name: "customer_id",
    type: "spldropdown",
    description: "Unique Id of customer",
    default: "",
    item: [],
    options:[],
    async init(data) {
          try {
            const list = await square.getAllCustomers(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["create", "update"],
      },
    },
    fields: createPayment
  },
  {
    displayName: "Payment ID",
    name: "Id",
    type: "string",
    description: "Unique Id of Payment",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["get", "update"]
      }
    }
  },
  {
    displayName: "Payment ID",
    name: "payment_id",
    type: "string",
    description: "Unique Id of Payment",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["payments"],
        name: ["delete"]
      }
    }
  },

  // Refund Payment
  {
    displayName: "Payment ID",
    name: "Id",
    type: "spldropdown",
    default: "",
    description: "Unique Id of Payment",
    item: [],
    required: true,
    options:[],
    async init(data) {
          try {
            const list = await square.getAllPayments(data);
            this.options = list;
          } catch (error) {
            return ({ 'Error occurred': error });
          }
        },
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Refund Idempotency Key",
    name: "idempotency_key",
    type: "string",
    description: "Unique Key",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Refund Amount",
    name: "amount_money__amount",
    type: "integer",
    description: "Amount",
    default: "",
    required: true,
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Refund Currency",
    name: "amount_money__currency",
    type: "dropdown",
    description: "Which Currency",
    item:[],
    default: "",
    options: [
      { name: "Unknown currency", value: "UNKNOWN_CURRENCY" },
      { name: "United Arab Emirates dirham", value: "AED" },
      { name: "Afghan afghani", value: "AFN" },
      { name: "Albanian lek", value: "ALL" },
      { name: "Armenian dram", value: "AMD" },
      { name: "Netherlands Antillean guilder", value: "ANG" },
      { name: "Angolan kwanza", value: "AOA" },
      { name: "Argentine peso", value: "ARS" },
      { name: "Australian dollar", value: "AUD" },
      { name: "Aruban florin", value: "AWG" },
      { name: "Azerbaijani manat", value: "AZN" },
      { name: "Bosnia and Herzegovina convertible mark", value: "BAM" },
      { name: "Barbados dollar", value: "BBD" },
      { name: "Bangladeshi taka", value: "BDT" },
      { name: "Bulgarian lev", value: "BGN" },
      { name: "Bahraini dinar", value: "BHD" },
      { name: "Burundian franc", value: "BIF" },
      { name: "Bermudian dollar", value: "BMD" },
      { name: "Brunei dollar", value: "BND" },
      { name: "Boliviano", value: "BOB" },
      { name: "Bolivian Mvdol", value: "BOV" },
      { name: "Brazilian real", value: "BRL" },
      { name: "Bahamian dollar", value: "BSD" },
      { name: "Bhutanese ngultrum", value: "BTN" },
      { name: "Botswana pula", value: "BWP" },
      { name: "Belarusian ruble", value: "BYR" },
      { name: "Belize dollar", value: "BZD" },
      { name: "Canadian dollar", value: "CAD" },
      { name: "Congolese franc", value: "CDF" },
      { name: "WIR Euro", value: "CHE" },
      { name: "Swiss franc", value: "CHF" },
      { name: "WIR Franc", value: "CHW" },
      { name: "Unidad de Fomento", value: "CLF" },
      { name: "Chilean peso", value: "CLP" },
      { name: "Chinese yuan", value: "CNY" },
      { name: "Colombian peso", value: "COP" },
      { name: "Unidad de Valor Real", value: "COU" },
      { name: "Costa Rican colon", value: "CRC" },
      { name: "Cuban convertible peso", value: "CUC" },
      { name: "Cuban peso", value: "CUP" },
      { name: "Cape Verdean escudo", value: "CVE" },
      { name: "Czech koruna", value: "CZK" },
      { name: "Djiboutian franc", value: "DJF" },
      { name: "Danish krone", value: "DKK" },
      { name: "Dominican peso", value: "DOP" },
      { name: "Algerian dinar", value: "DZD" },
      { name: "Egyptian pound", value: "EGP" },
      { name: "Eritrean nakfa", value: "ERN" },
      { name: "Ethiopian birr", value: "ETB" },
      { name: "Euro", value: "EUR" },
      { name: "Fiji dollar", value: "FJD" },
      { name: "Falkland Islands pound", value: "FKP" },
      { name: "Pound sterling", value: "GBP" },
      { name: "Georgian lari", value: "GEL" },
      { name: "Ghanaian cedi", value: "GHS" },
      { name: "Gibraltar pound", value: "GIP" },
      { name: "Gambian dalasi", value: "GMD" },
      { name: "Guinean franc", value: "GNF" },
      { name: "Guatemalan quetzal", value: "GTQ" },
      { name: "Guyanese dollar", value: "GYD" },
      { name: "Hong Kong dollar", value: "HKD" },
      { name: "Honduran lempira", value: "HNL" },
      { name: "Croatian kuna", value: "HRK" },
      { name: "Haitian gourde", value: "HTG" },
      { name: "Hungarian forint", value: "HUF" },
      { name: "Indonesian rupiah", value: "IDR" },
      { name: "Israeli new shekel", value: "ILS" },
      { name: "Indian rupee", value: "INR" },
      { name: "Iraqi dinar", value: "IQD" },
      { name: "Iranian rial", value: "IRR" },
      { name: "Icelandic króna", value: "ISK" },
      { name: "Jamaican dollar", value: "JMD" },
      { name: "Jordanian dinar", value: "JOD" },
      { name: "Japanese yen", value: "JPY" },
      { name: "Kenyan shilling", value: "KES" },
      { name: "Kyrgyzstani som", value: "KGS" },
      { name: "Cambodian riel", value: "KHR" },
      { name: "Comoro franc", value: "KMF" },
      { name: "North Korean won", value: "KPW" },
      { name: "South Korean won", value: "KRW" },
      { name: "Kuwaiti dinar", value: "KWD" },
      { name: "Cayman Islands dollar", value: "KYD" },
      { name: "Kazakhstani tenge", value: "KZT" },
      { name: "Lao kip", value: "LAK" },
      { name: "Lebanese pound", value: "LBP" },
      { name: "Sri Lankan rupee", value: "LKR" },
      { name: "Liberian dollar", value: "LRD" },
      { name: "Lesotho loti", value: "LSL" },
      { name: "Lithuanian litas", value: "LTL" },
      { name: "Latvian lats", value: "LVL" },
      { name: "Libyan dinar", value: "LYD" },
      { name: "Moroccan dirham", value: "MAD" },
      { name: "Moldovan leu", value: "MDL" },
      { name: "Malagasy ariary", value: "MGA" },
      { name: "Macedonian denar", value: "MKD" },
      { name: "Myanmar kyat", value: "MMK" },
      { name: "Mongolian tögrög", value: "MNT" },
      { name: "Macanese pataca", value: "MOP" },
      { name: "Mauritanian ouguiya", value: "MRO" },
      { name: "Mauritian rupee", value: "MUR" },
      { name: "Maldivian rufiyaa", value: "MVR" },
      { name: "Malawian kwacha", value: "MWK" },
      { name: "Mexican peso", value: "MXN" },
      { name: "Mexican Unidad de Inversion", value: "MXV" },
      { name: "Malaysian ringgit", value: "MYR" },
      { name: "Mozambican metical", value: "MZN" },
      { name: "Namibian dollar", value: "NAD" },
      { name: "Nigerian naira", value: "NGN" },
      { name: "Nicaraguan córdoba", value: "NIO" },
      { name: "Norwegian krone", value: "NOK" },
      { name: "Nepalese rupee", value: "NPR" },
      { name: "New Zealand dollar", value: "NZD" },
      { name: "Omani rial", value: "OMR" },
      { name: "Panamanian balboa", value: "PAB" },
      { name: "Peruvian sol", value: "PEN" },
      { name: "Papua New Guinean kina", value: "PGK" },
      { name: "Philippine peso", value: "PHP" },
      { name: "Pakistani rupee", value: "PKR" },
      { name: "Polish złoty", value: "PLN" },
      { name: "Paraguayan guaraní", value: "PYG" },
      { name: "Qatari riyal", value: "QAR" },
      { name: "Romanian leu", value: "RON" },
      { name: "Serbian dinar", value: "RSD" },
      { name: "Russian ruble", value: "RUB" },
      { name: "Rwandan franc", value: "RWF" },
      { name: "Saudi riyal", value: "SAR" },
      { name: "Solomon Islands dollar", value: "SBD" },
      { name: "Seychelles rupee", value: "SCR" },
      { name: "Sudanese pound", value: "SDG" },
      { name: "Swedish krona", value: "SEK" },
      { name: "Singapore dollar", value: "SGD" },
      { name: "Saint Helena pound", value: "SHP" },
      { name: "Sierra Leonean first leone", value: "SLL" },
      { name: "Sierra Leonean second leone", value: "SLE" },
      { name: "Somali shilling", value: "SOS" },
      { name: "Surinamese dollar", value: "SRD" },
      { name: "South Sudanese pound", value: "SSP" },
      { name: "São Tomé and Príncipe dobra", value: "STD" },
      { name: "Salvadoran colón", value: "SVC" },
      { name: "Syrian pound", value: "SYP" },
      { name: "Swazi lilangeni", value: "SZL" },
      { name: "Thai baht", value: "THB" },
      { name: "Tajikstani somoni", value: "TJS" },
      { name: "Turkmenistan manat", value: "TMT" },
      { name: "Tunisian dinar", value: "TND" },
      { name: "Tongan pa'anga", value: "TOP" },
      { name: "Turkish lira", value: "TRY" },
      { name: "Trinidad and Tobago dollar", value: "TTD" },
      { name: "New Taiwan dollar", value: "TWD" },
      { name: "Tanzanian shilling", value: "TZS" },
      { name: "Ukrainian hryvnia", value: "UAH" },
      { name: "Ugandan shilling", value: "UGX" },
      { name: "United States dollar", value: "USD" },
      { name: "United States dollar (next day)", value: "USN" },
      { name: "United States dollar (same day)", value: "USS" },
      { name: "Uruguay Peso en Unidedades Indexadas", value: "UYI" },
      { name: "Uruguyan peso", value: "UYU" },
      { name: "Uzbekistan som", value: "UZS" },
      { name: "Venezuelan bolívar soberano", value: "VEF" },
      { name: "Vietnamese đồng", value: "VND" },
      { name: "Vanuatu vatu", value: "VUV" },
      { name: "Samoan tala", value: "WST" },
      { name: "CFA franc BEAC", value: "XAF" },
      { name: "Silver", value: "XAG" },
      { name: "Gold", value: "XAU" },
      { name: "European Composite Unit", value: "XBA" },
      { name: "European Monetary Unit", value: "XBB" },
      { name: "European Unit of Account 9", value: "XBC" },
      { name: "European Unit of Account 17", value: "XBD" },
      { name: "East Caribbean dollar", value: "XCD" },
      { name: "Special drawing rights (International Monetary Fund)", value: "XDR" },
      { name: "CFA franc BCEAO", value: "XOF" },
      { name: "Palladium", value: "XPD" },
      { name: "CFP franc", value: "XPF" },
      { name: "Platinum", value: "XPT" },
      { name: "Code reserved for testing", value: "XTS" },
      { name: "No currency", value: "XXX" },
      { name: "Yemeni rial", value: "YER" },
      { name: "South African rand", value: "ZAR" },
      { name: "Zambian kwacha", value: "ZMK" },
      { name: "Zambian kwacha", value: "ZMW" },
      { name: "Bitcoin", value: "BTC" },
      { name: "USD Coin", value: "XUS" }
    ],
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Reason",
    name: "reason",
    type: "string",
    description: "Reason of Refund",
    item:[],
    default: "",
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["create"]
      }
    }
  },
  {
    displayName: "Additional Fields",
    name: "additionl fields",
    type: "string",
    description: "Additional Fields",
    default: "",
    items: [],
    required: true,
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["create"],
      },
    },
    fields: createPaymentRefund
  },
  {
    displayName: "Refund ID",
    name: "Id",
    type: "string",
    description: "Unique Id of Refund",
    default: "",
    item: [],
    required: true,
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["get"]
      }
    }
  },


  // Get Many Payments
  {
    displayName: "Where",
    name: "where",
    type: "filter",
    placeholder: "Specify the conditions to filter items",
    default: "",
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["paymentsrefund"],
        name: ["getMany"],
      },
    },
    fields: getManyPaymentsRefund
  },

  /// tax
  {
    "displayName": "Idempotency Key",
    "name": "idempotency_key",
    "type": "string",
    "description": "A unique key to ensure that the request is not processed multiple times.",
    "default": "",
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Object Type",
    "name": "object__type",
    "type": "dropdown",
    "description": "The type of the object (e.g., TAX).",
    "default": "",
    item: [],
    "required": true,
    options: [
      { name: "Tax", value: "TAX" },
    ],
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Object ID",
    "name": "object__id",
    "type": "string",
    "description": "The unique identifier for the object.",
    "default": "",
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Tax Name",
    "name": "object__tax_data__name",
    "type": "string",
    "description": "The name of the tax.",
    "default": "",
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Calculation Phase",
    "name": "object__tax_data__calculation_phase",
    "type": "string",
    "description": "The phase of the tax calculation (e.g., TAX_TOTAL_PHASE).",
    "default": "",
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Inclusion Type",
    "name": "object__tax_data__inclusion_type",
    "type": "dropdown",
    "description": "Indicates how the tax is included (e.g., ADDITIVE).",
    "default": "",
    item: [],
    "required": true,
    options: [
      { name: "ADDITIVE", value: "ADDITIVE" },
      { name: "INCLUSIVE", value: "INCLUSIVE" },
    ],
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Tax Percentage",
    "name": "object__tax_data__percentage",
    "type": "string",
    "description": "The tax percentage as a string representation of a decimal number.",
    "default": "",
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Applies to Custom Amounts",
    "name": "object__tax_data__applies_to_custom_amounts",
    "type": "boolean",
    "description": "Indicates whether the tax applies to custom amounts.",
    "default": false,
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Enabled",
    "name": "object__tax_data__enabled",
    "type": "dropdown",
    "description": "Indicates whether the tax is enabled.",
    "default": false,
    item: [],
    "required": true,
    options: [
      { name: "true", value: "true" },
      { name: "false", value: "false" },
    ],
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["create", "update"]
      }
    }
  },
  {
    "displayName": "Tax Id",
    "name": "Id",
    "type": "string",
    "description": "Unique Id of tax",
    "default": "",
    item: [],
    "required": true,
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["get", "delete"]
      }
    }
  },
  {
    displayName: "Where",
    name: "where",
    type: "filter",
    placeholder: "Specify the conditions to filter items",
    default: "",
    items: [],
    required: false,
    options: [],
    displayOptions: {
      show: {
        category: ["tax"],
        name: ["getMany"],
      },
    },
    fields: [
      {
        "displayName": "Cursor",
        "name": "cursor",
        "type": "string",
        "description": "Pagination cursor to retrieve the next set of results from a previous query.",
        "default": "",
        "required": false
      },
      {
        "displayName": "Limit",
        "name": "limit",
        "type": "integer",
        "description": "Maximum number of results per page (max 100).",
        "default": "",
        "required": false
      },
    ]
  },


]

export default {
  XappName,
  modules,
};