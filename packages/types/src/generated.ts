/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigFloat: { input: string; output: number; }
  BigInt: { input: string; output: string; }
  Cursor: { input: string; output: string; }
  Date: { input: string; output: string; }
  Datetime: { input: string; output: string; }
  JSON: { input: unknown; output: unknown; }
  Opaque: { input: unknown; output: unknown; }
  Time: { input: string; output: string; }
  UUID: { input: string; output: string; }
};

/** Boolean expression comparing fields on type "BigFloat" */
export type BigFloatFilter = {
  eq?: InputMaybe<Scalars['BigFloat']['input']>;
  gt?: InputMaybe<Scalars['BigFloat']['input']>;
  gte?: InputMaybe<Scalars['BigFloat']['input']>;
  in?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigFloat']['input']>;
  lte?: InputMaybe<Scalars['BigFloat']['input']>;
  neq?: InputMaybe<Scalars['BigFloat']['input']>;
};

/** Boolean expression comparing fields on type "BigFloatList" */
export type BigFloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigFloat']['input']>>;
};

/** Boolean expression comparing fields on type "BigInt" */
export type BigIntFilter = {
  eq?: InputMaybe<Scalars['BigInt']['input']>;
  gt?: InputMaybe<Scalars['BigInt']['input']>;
  gte?: InputMaybe<Scalars['BigInt']['input']>;
  in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['BigInt']['input']>;
  lte?: InputMaybe<Scalars['BigInt']['input']>;
  neq?: InputMaybe<Scalars['BigInt']['input']>;
};

/** Boolean expression comparing fields on type "BigIntList" */
export type BigIntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  contains?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  eq?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

/** Boolean expression comparing fields on type "Boolean" */
export type BooleanFilter = {
  eq?: InputMaybe<Scalars['Boolean']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Boolean expression comparing fields on type "BooleanList" */
export type BooleanListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  contains?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  eq?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression comparing fields on type "Date" */
export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

/** Boolean expression comparing fields on type "DateList" */
export type DateListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Date']['input']>>;
  contains?: InputMaybe<Array<Scalars['Date']['input']>>;
  eq?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Date']['input']>>;
};

/** Boolean expression comparing fields on type "Datetime" */
export type DatetimeFilter = {
  eq?: InputMaybe<Scalars['Datetime']['input']>;
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  in?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
  neq?: InputMaybe<Scalars['Datetime']['input']>;
};

/** Boolean expression comparing fields on type "DatetimeList" */
export type DatetimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  contains?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  eq?: InputMaybe<Array<Scalars['Datetime']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Datetime']['input']>>;
};

export enum FilterIs {
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

/** Boolean expression comparing fields on type "Float" */
export type FloatFilter = {
  eq?: InputMaybe<Scalars['Float']['input']>;
  gt?: InputMaybe<Scalars['Float']['input']>;
  gte?: InputMaybe<Scalars['Float']['input']>;
  in?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Float']['input']>;
  lte?: InputMaybe<Scalars['Float']['input']>;
  neq?: InputMaybe<Scalars['Float']['input']>;
};

/** Boolean expression comparing fields on type "FloatList" */
export type FloatListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Float']['input']>>;
  contains?: InputMaybe<Array<Scalars['Float']['input']>>;
  eq?: InputMaybe<Array<Scalars['Float']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Float']['input']>>;
};

/** Boolean expression comparing fields on type "ID" */
export type IdFilter = {
  eq?: InputMaybe<Scalars['ID']['input']>;
};

/** Boolean expression comparing fields on type "Int" */
export type IntFilter = {
  eq?: InputMaybe<Scalars['Int']['input']>;
  gt?: InputMaybe<Scalars['Int']['input']>;
  gte?: InputMaybe<Scalars['Int']['input']>;
  in?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Int']['input']>;
  lte?: InputMaybe<Scalars['Int']['input']>;
  neq?: InputMaybe<Scalars['Int']['input']>;
};

/** Boolean expression comparing fields on type "IntList" */
export type IntListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Int']['input']>>;
  contains?: InputMaybe<Array<Scalars['Int']['input']>>;
  eq?: InputMaybe<Array<Scalars['Int']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** The root type for creating and mutating data */
export type Mutation = {
  __typename?: 'Mutation';
  apply_meal_slot_budgets?: Maybe<Scalars['Opaque']['output']>;
  create_trip_with_meal_slots?: Maybe<Trips>;
  /** Deletes zero or more records from the `badges` collection */
  deleteFrombadgesCollection: BadgesDeleteResponse;
  /** Deletes zero or more records from the `budget_change_history` collection */
  deleteFrombudget_change_historyCollection: Budget_Change_HistoryDeleteResponse;
  /** Deletes zero or more records from the `chat_messages` collection */
  deleteFromchat_messagesCollection: Chat_MessagesDeleteResponse;
  /** Deletes zero or more records from the `diaries` collection */
  deleteFromdiariesCollection: DiariesDeleteResponse;
  /** Deletes zero or more records from the `exp_ledger` collection */
  deleteFromexp_ledgerCollection: Exp_LedgerDeleteResponse;
  /** Deletes zero or more records from the `meal_logs` collection */
  deleteFrommeal_logsCollection: Meal_LogsDeleteResponse;
  /** Deletes zero or more records from the `meal_slots` collection */
  deleteFrommeal_slotsCollection: Meal_SlotsDeleteResponse;
  /** Deletes zero or more records from the `profiles` collection */
  deleteFromprofilesCollection: ProfilesDeleteResponse;
  /** Deletes zero or more records from the `region_cache` collection */
  deleteFromregion_cacheCollection: Region_CacheDeleteResponse;
  /** Deletes zero or more records from the `restaurants` collection */
  deleteFromrestaurantsCollection: RestaurantsDeleteResponse;
  /** Deletes zero or more records from the `trips` collection */
  deleteFromtripsCollection: TripsDeleteResponse;
  /** Deletes zero or more records from the `user_badges` collection */
  deleteFromuser_badgesCollection: User_BadgesDeleteResponse;
  delete_meal_log?: Maybe<Scalars['Opaque']['output']>;
  edit_trip_budget?: Maybe<Trips>;
  generate_random_handle?: Maybe<Scalars['String']['output']>;
  generate_random_nickname?: Maybe<Scalars['String']['output']>;
  /** Adds one or more `badges` records to the collection */
  insertIntobadgesCollection?: Maybe<BadgesInsertResponse>;
  /** Adds one or more `budget_change_history` records to the collection */
  insertIntobudget_change_historyCollection?: Maybe<Budget_Change_HistoryInsertResponse>;
  /** Adds one or more `chat_messages` records to the collection */
  insertIntochat_messagesCollection?: Maybe<Chat_MessagesInsertResponse>;
  /** Adds one or more `diaries` records to the collection */
  insertIntodiariesCollection?: Maybe<DiariesInsertResponse>;
  /** Adds one or more `exp_ledger` records to the collection */
  insertIntoexp_ledgerCollection?: Maybe<Exp_LedgerInsertResponse>;
  /** Adds one or more `meal_logs` records to the collection */
  insertIntomeal_logsCollection?: Maybe<Meal_LogsInsertResponse>;
  /** Adds one or more `meal_slots` records to the collection */
  insertIntomeal_slotsCollection?: Maybe<Meal_SlotsInsertResponse>;
  /** Adds one or more `profiles` records to the collection */
  insertIntoprofilesCollection?: Maybe<ProfilesInsertResponse>;
  /** Adds one or more `region_cache` records to the collection */
  insertIntoregion_cacheCollection?: Maybe<Region_CacheInsertResponse>;
  /** Adds one or more `restaurants` records to the collection */
  insertIntorestaurantsCollection?: Maybe<RestaurantsInsertResponse>;
  /** Adds one or more `trips` records to the collection */
  insertIntotripsCollection?: Maybe<TripsInsertResponse>;
  /** Adds one or more `user_badges` records to the collection */
  insertIntouser_badgesCollection?: Maybe<User_BadgesInsertResponse>;
  record_meal_log?: Maybe<Meal_Logs>;
  update_meal_log?: Maybe<Meal_Logs>;
  /** Updates zero or more records in the `badges` collection */
  updatebadgesCollection: BadgesUpdateResponse;
  /** Updates zero or more records in the `budget_change_history` collection */
  updatebudget_change_historyCollection: Budget_Change_HistoryUpdateResponse;
  /** Updates zero or more records in the `chat_messages` collection */
  updatechat_messagesCollection: Chat_MessagesUpdateResponse;
  /** Updates zero or more records in the `diaries` collection */
  updatediariesCollection: DiariesUpdateResponse;
  /** Updates zero or more records in the `exp_ledger` collection */
  updateexp_ledgerCollection: Exp_LedgerUpdateResponse;
  /** Updates zero or more records in the `meal_logs` collection */
  updatemeal_logsCollection: Meal_LogsUpdateResponse;
  /** Updates zero or more records in the `meal_slots` collection */
  updatemeal_slotsCollection: Meal_SlotsUpdateResponse;
  /** Updates zero or more records in the `profiles` collection */
  updateprofilesCollection: ProfilesUpdateResponse;
  /** Updates zero or more records in the `region_cache` collection */
  updateregion_cacheCollection: Region_CacheUpdateResponse;
  /** Updates zero or more records in the `restaurants` collection */
  updaterestaurantsCollection: RestaurantsUpdateResponse;
  /** Updates zero or more records in the `trips` collection */
  updatetripsCollection: TripsUpdateResponse;
  /** Updates zero or more records in the `user_badges` collection */
  updateuser_badgesCollection: User_BadgesUpdateResponse;
};


/** The root type for creating and mutating data */
export type MutationApply_Meal_Slot_BudgetsArgs = {
  p_budget_amounts: Array<InputMaybe<Scalars['Int']['input']>>;
  p_slot_ids: Array<InputMaybe<Scalars['UUID']['input']>>;
  p_weight_levels?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/** The root type for creating and mutating data */
export type MutationCreate_Trip_With_Meal_SlotsArgs = {
  p_budget_amounts: Array<InputMaybe<Scalars['Int']['input']>>;
  p_dates: Array<InputMaybe<Scalars['Date']['input']>>;
  p_end_date: Scalars['Date']['input'];
  p_fixed_cost: Scalars['Int']['input'];
  p_floating_budget: Scalars['Int']['input'];
  p_food_budget_ratio: Scalars['BigFloat']['input'];
  p_meal_types: Array<InputMaybe<Scalars['String']['input']>>;
  p_name: Scalars['String']['input'];
  p_region_code: Scalars['String']['input'];
  p_start_date: Scalars['Date']['input'];
  p_total_budget: Scalars['Int']['input'];
  p_weight_levels: Array<InputMaybe<Scalars['String']['input']>>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrombadgesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BadgesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrombudget_Change_HistoryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Budget_Change_HistoryFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromchat_MessagesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Chat_MessagesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromdiariesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<DiariesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromexp_LedgerCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Exp_LedgerFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommeal_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_LogsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFrommeal_SlotsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_SlotsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromprofilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromregion_CacheCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Region_CacheFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromrestaurantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<RestaurantsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromtripsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<TripsFilter>;
};


/** The root type for creating and mutating data */
export type MutationDeleteFromuser_BadgesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_BadgesFilter>;
};


/** The root type for creating and mutating data */
export type MutationDelete_Meal_LogArgs = {
  p_meal_log_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationEdit_Trip_BudgetArgs = {
  p_fixed_cost: Scalars['Int']['input'];
  p_floating_budget: Scalars['Int']['input'];
  p_name: Scalars['String']['input'];
  p_slot_amounts: Array<InputMaybe<Scalars['Int']['input']>>;
  p_slot_ids: Array<InputMaybe<Scalars['UUID']['input']>>;
  p_total_budget: Scalars['Int']['input'];
  p_trip_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationInsertIntobadgesCollectionArgs = {
  objects: Array<BadgesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntobudget_Change_HistoryCollectionArgs = {
  objects: Array<Budget_Change_HistoryInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntochat_MessagesCollectionArgs = {
  objects: Array<Chat_MessagesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntodiariesCollectionArgs = {
  objects: Array<DiariesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoexp_LedgerCollectionArgs = {
  objects: Array<Exp_LedgerInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomeal_LogsCollectionArgs = {
  objects: Array<Meal_LogsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntomeal_SlotsCollectionArgs = {
  objects: Array<Meal_SlotsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoprofilesCollectionArgs = {
  objects: Array<ProfilesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntoregion_CacheCollectionArgs = {
  objects: Array<Region_CacheInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntorestaurantsCollectionArgs = {
  objects: Array<RestaurantsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntotripsCollectionArgs = {
  objects: Array<TripsInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationInsertIntouser_BadgesCollectionArgs = {
  objects: Array<User_BadgesInsertInput>;
};


/** The root type for creating and mutating data */
export type MutationRecord_Meal_LogArgs = {
  p_amount: Scalars['Int']['input'];
  p_meal_slot_id: Scalars['UUID']['input'];
  p_memo?: InputMaybe<Scalars['String']['input']>;
  p_source: Scalars['String']['input'];
  p_store_address?: InputMaybe<Scalars['String']['input']>;
  p_store_name?: InputMaybe<Scalars['String']['input']>;
  p_trip_id: Scalars['UUID']['input'];
};


/** The root type for creating and mutating data */
export type MutationUpdate_Meal_LogArgs = {
  p_amount: Scalars['Int']['input'];
  p_category?: InputMaybe<Scalars['String']['input']>;
  p_meal_log_id: Scalars['UUID']['input'];
  p_memo?: InputMaybe<Scalars['String']['input']>;
  p_store_address?: InputMaybe<Scalars['String']['input']>;
  p_store_name?: InputMaybe<Scalars['String']['input']>;
};


/** The root type for creating and mutating data */
export type MutationUpdatebadgesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<BadgesFilter>;
  set: BadgesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatebudget_Change_HistoryCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Budget_Change_HistoryFilter>;
  set: Budget_Change_HistoryUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatechat_MessagesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Chat_MessagesFilter>;
  set: Chat_MessagesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatediariesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<DiariesFilter>;
  set: DiariesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateexp_LedgerCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Exp_LedgerFilter>;
  set: Exp_LedgerUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemeal_LogsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_LogsFilter>;
  set: Meal_LogsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatemeal_SlotsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Meal_SlotsFilter>;
  set: Meal_SlotsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateprofilesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<ProfilesFilter>;
  set: ProfilesUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateregion_CacheCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<Region_CacheFilter>;
  set: Region_CacheUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdaterestaurantsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<RestaurantsFilter>;
  set: RestaurantsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdatetripsCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<TripsFilter>;
  set: TripsUpdateInput;
};


/** The root type for creating and mutating data */
export type MutationUpdateuser_BadgesCollectionArgs = {
  atMost?: Scalars['Int']['input'];
  filter?: InputMaybe<User_BadgesFilter>;
  set: User_BadgesUpdateInput;
};

export type Node = {
  /** Retrieves a record by `ID` */
  nodeId: Scalars['ID']['output'];
};

/** Boolean expression comparing fields on type "Opaque" */
export type OpaqueFilter = {
  eq?: InputMaybe<Scalars['Opaque']['input']>;
  is?: InputMaybe<FilterIs>;
};

/** Defines a per-field sorting order */
export enum OrderByDirection {
  /** Ascending order, nulls first */
  AscNullsFirst = 'AscNullsFirst',
  /** Ascending order, nulls last */
  AscNullsLast = 'AscNullsLast',
  /** Descending order, nulls first */
  DescNullsFirst = 'DescNullsFirst',
  /** Descending order, nulls last */
  DescNullsLast = 'DescNullsLast'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** The root type for querying data */
export type Query = {
  __typename?: 'Query';
  /** Retrieve a record of type `badges` by its primary key */
  badgesByPk?: Maybe<Badges>;
  /** A pagable collection of type `badges` */
  badgesCollection: BadgesConnection;
  /** Retrieve a record of type `budget_change_history` by its primary key */
  budget_change_historyByPk?: Maybe<Budget_Change_History>;
  /** A pagable collection of type `budget_change_history` */
  budget_change_historyCollection: Budget_Change_HistoryConnection;
  /** Retrieve a record of type `chat_messages` by its primary key */
  chat_messagesByPk?: Maybe<Chat_Messages>;
  /** A pagable collection of type `chat_messages` */
  chat_messagesCollection: Chat_MessagesConnection;
  /** Retrieve a record of type `diaries` by its primary key */
  diariesByPk?: Maybe<Diaries>;
  /** A pagable collection of type `diaries` */
  diariesCollection: DiariesConnection;
  /** Retrieve a record of type `exp_ledger` by its primary key */
  exp_ledgerByPk?: Maybe<Exp_Ledger>;
  /** A pagable collection of type `exp_ledger` */
  exp_ledgerCollection: Exp_LedgerConnection;
  /** Retrieve a record of type `meal_logs` by its primary key */
  meal_logsByPk?: Maybe<Meal_Logs>;
  /** A pagable collection of type `meal_logs` */
  meal_logsCollection: Meal_LogsConnection;
  /** Retrieve a record of type `meal_slots` by its primary key */
  meal_slotsByPk?: Maybe<Meal_Slots>;
  /** A pagable collection of type `meal_slots` */
  meal_slotsCollection: Meal_SlotsConnection;
  /** Retrieve a record by its `ID` */
  node?: Maybe<Node>;
  /** Retrieve a record of type `profiles` by its primary key */
  profilesByPk?: Maybe<Profiles>;
  /** A pagable collection of type `profiles` */
  profilesCollection: ProfilesConnection;
  /** Retrieve a record of type `region_cache` by its primary key */
  region_cacheByPk?: Maybe<Region_Cache>;
  /** A pagable collection of type `region_cache` */
  region_cacheCollection: Region_CacheConnection;
  /** Retrieve a record of type `restaurants` by its primary key */
  restaurantsByPk?: Maybe<Restaurants>;
  /** A pagable collection of type `restaurants` */
  restaurantsCollection: RestaurantsConnection;
  /** Retrieve a record of type `trips` by its primary key */
  tripsByPk?: Maybe<Trips>;
  /** A pagable collection of type `trips` */
  tripsCollection: TripsConnection;
  /** Retrieve a record of type `user_badges` by its primary key */
  user_badgesByPk?: Maybe<User_Badges>;
  /** A pagable collection of type `user_badges` */
  user_badgesCollection: User_BadgesConnection;
};


/** The root type for querying data */
export type QueryBadgesByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryBadgesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<BadgesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<BadgesOrderBy>>;
};


/** The root type for querying data */
export type QueryBudget_Change_HistoryByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryBudget_Change_HistoryCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Budget_Change_HistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Budget_Change_HistoryOrderBy>>;
};


/** The root type for querying data */
export type QueryChat_MessagesByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryChat_MessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Chat_MessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Chat_MessagesOrderBy>>;
};


/** The root type for querying data */
export type QueryDiariesByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryDiariesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<DiariesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<DiariesOrderBy>>;
};


/** The root type for querying data */
export type QueryExp_LedgerByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryExp_LedgerCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exp_LedgerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exp_LedgerOrderBy>>;
};


/** The root type for querying data */
export type QueryMeal_LogsByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryMeal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_LogsOrderBy>>;
};


/** The root type for querying data */
export type QueryMeal_SlotsByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryMeal_SlotsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_SlotsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_SlotsOrderBy>>;
};


/** The root type for querying data */
export type QueryNodeArgs = {
  nodeId: Scalars['ID']['input'];
};


/** The root type for querying data */
export type QueryProfilesByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryProfilesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<ProfilesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<ProfilesOrderBy>>;
};


/** The root type for querying data */
export type QueryRegion_CacheByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryRegion_CacheCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Region_CacheFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Region_CacheOrderBy>>;
};


/** The root type for querying data */
export type QueryRestaurantsByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryRestaurantsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<RestaurantsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<RestaurantsOrderBy>>;
};


/** The root type for querying data */
export type QueryTripsByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryTripsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<TripsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<TripsOrderBy>>;
};


/** The root type for querying data */
export type QueryUser_BadgesByPkArgs = {
  id: Scalars['UUID']['input'];
};


/** The root type for querying data */
export type QueryUser_BadgesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_BadgesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_BadgesOrderBy>>;
};

/** Boolean expression comparing fields on type "String" */
export type StringFilter = {
  eq?: InputMaybe<Scalars['String']['input']>;
  gt?: InputMaybe<Scalars['String']['input']>;
  gte?: InputMaybe<Scalars['String']['input']>;
  ilike?: InputMaybe<Scalars['String']['input']>;
  in?: InputMaybe<Array<Scalars['String']['input']>>;
  iregex?: InputMaybe<Scalars['String']['input']>;
  is?: InputMaybe<FilterIs>;
  like?: InputMaybe<Scalars['String']['input']>;
  lt?: InputMaybe<Scalars['String']['input']>;
  lte?: InputMaybe<Scalars['String']['input']>;
  neq?: InputMaybe<Scalars['String']['input']>;
  regex?: InputMaybe<Scalars['String']['input']>;
  startsWith?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression comparing fields on type "StringList" */
export type StringListFilter = {
  containedBy?: InputMaybe<Array<Scalars['String']['input']>>;
  contains?: InputMaybe<Array<Scalars['String']['input']>>;
  eq?: InputMaybe<Array<Scalars['String']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** Boolean expression comparing fields on type "Time" */
export type TimeFilter = {
  eq?: InputMaybe<Scalars['Time']['input']>;
  gt?: InputMaybe<Scalars['Time']['input']>;
  gte?: InputMaybe<Scalars['Time']['input']>;
  in?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Time']['input']>;
  lte?: InputMaybe<Scalars['Time']['input']>;
  neq?: InputMaybe<Scalars['Time']['input']>;
};

/** Boolean expression comparing fields on type "TimeList" */
export type TimeListFilter = {
  containedBy?: InputMaybe<Array<Scalars['Time']['input']>>;
  contains?: InputMaybe<Array<Scalars['Time']['input']>>;
  eq?: InputMaybe<Array<Scalars['Time']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['Time']['input']>>;
};

/** Boolean expression comparing fields on type "UUID" */
export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

/** Boolean expression comparing fields on type "UUIDList" */
export type UuidListFilter = {
  containedBy?: InputMaybe<Array<Scalars['UUID']['input']>>;
  contains?: InputMaybe<Array<Scalars['UUID']['input']>>;
  eq?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  overlaps?: InputMaybe<Array<Scalars['UUID']['input']>>;
};

export type Badges = Node & {
  __typename?: 'badges';
  bonus_points: Scalars['Int']['output'];
  category: Scalars['String']['output'];
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  user_badgesCollection?: Maybe<User_BadgesConnection>;
};


export type BadgesUser_BadgesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_BadgesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_BadgesOrderBy>>;
};

export type BadgesConnection = {
  __typename?: 'badgesConnection';
  edges: Array<BadgesEdge>;
  pageInfo: PageInfo;
};

export type BadgesDeleteResponse = {
  __typename?: 'badgesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Badges>;
};

export type BadgesEdge = {
  __typename?: 'badgesEdge';
  cursor: Scalars['String']['output'];
  node: Badges;
};

export type BadgesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<BadgesFilter>>;
  bonus_points?: InputMaybe<IntFilter>;
  category?: InputMaybe<StringFilter>;
  code?: InputMaybe<StringFilter>;
  description?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<BadgesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<BadgesFilter>>;
};

export type BadgesInsertInput = {
  bonus_points?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type BadgesInsertResponse = {
  __typename?: 'badgesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Badges>;
};

export type BadgesOrderBy = {
  bonus_points?: InputMaybe<OrderByDirection>;
  category?: InputMaybe<OrderByDirection>;
  code?: InputMaybe<OrderByDirection>;
  description?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
};

export type BadgesUpdateInput = {
  bonus_points?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type BadgesUpdateResponse = {
  __typename?: 'badgesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Badges>;
};

export type Budget_Change_History = Node & {
  __typename?: 'budget_change_history';
  after_json?: Maybe<Scalars['JSON']['output']>;
  amount_delta: Scalars['Int']['output'];
  before_json?: Maybe<Scalars['JSON']['output']>;
  created_at: Scalars['Datetime']['output'];
  event_type: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  trip_id: Scalars['UUID']['output'];
  trips?: Maybe<Trips>;
};

export type Budget_Change_HistoryConnection = {
  __typename?: 'budget_change_historyConnection';
  edges: Array<Budget_Change_HistoryEdge>;
  pageInfo: PageInfo;
};

export type Budget_Change_HistoryDeleteResponse = {
  __typename?: 'budget_change_historyDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Budget_Change_History>;
};

export type Budget_Change_HistoryEdge = {
  __typename?: 'budget_change_historyEdge';
  cursor: Scalars['String']['output'];
  node: Budget_Change_History;
};

export type Budget_Change_HistoryFilter = {
  amount_delta?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Budget_Change_HistoryFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  event_type?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Budget_Change_HistoryFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Budget_Change_HistoryFilter>>;
  trip_id?: InputMaybe<UuidFilter>;
};

export type Budget_Change_HistoryInsertInput = {
  after_json?: InputMaybe<Scalars['JSON']['input']>;
  amount_delta?: InputMaybe<Scalars['Int']['input']>;
  before_json?: InputMaybe<Scalars['JSON']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Budget_Change_HistoryInsertResponse = {
  __typename?: 'budget_change_historyInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Budget_Change_History>;
};

export type Budget_Change_HistoryOrderBy = {
  amount_delta?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  event_type?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
};

export type Budget_Change_HistoryUpdateInput = {
  after_json?: InputMaybe<Scalars['JSON']['input']>;
  amount_delta?: InputMaybe<Scalars['Int']['input']>;
  before_json?: InputMaybe<Scalars['JSON']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Budget_Change_HistoryUpdateResponse = {
  __typename?: 'budget_change_historyUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Budget_Change_History>;
};

export type Chat_Messages = Node & {
  __typename?: 'chat_messages';
  content: Scalars['String']['output'];
  created_at: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  parsed_amount?: Maybe<Scalars['Int']['output']>;
  parsed_category?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  status: Scalars['String']['output'];
  trip_id: Scalars['UUID']['output'];
  trips?: Maybe<Trips>;
  updated_at: Scalars['Datetime']['output'];
  user_id: Scalars['UUID']['output'];
};

export type Chat_MessagesConnection = {
  __typename?: 'chat_messagesConnection';
  edges: Array<Chat_MessagesEdge>;
  pageInfo: PageInfo;
};

export type Chat_MessagesDeleteResponse = {
  __typename?: 'chat_messagesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Chat_Messages>;
};

export type Chat_MessagesEdge = {
  __typename?: 'chat_messagesEdge';
  cursor: Scalars['String']['output'];
  node: Chat_Messages;
};

export type Chat_MessagesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Chat_MessagesFilter>>;
  content?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Chat_MessagesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Chat_MessagesFilter>>;
  parsed_amount?: InputMaybe<IntFilter>;
  parsed_category?: InputMaybe<StringFilter>;
  role?: InputMaybe<StringFilter>;
  status?: InputMaybe<StringFilter>;
  trip_id?: InputMaybe<UuidFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Chat_MessagesInsertInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  parsed_amount?: InputMaybe<Scalars['Int']['input']>;
  parsed_category?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Chat_MessagesInsertResponse = {
  __typename?: 'chat_messagesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Chat_Messages>;
};

export type Chat_MessagesOrderBy = {
  content?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  parsed_amount?: InputMaybe<OrderByDirection>;
  parsed_category?: InputMaybe<OrderByDirection>;
  role?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Chat_MessagesUpdateInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  parsed_amount?: InputMaybe<Scalars['Int']['input']>;
  parsed_category?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Chat_MessagesUpdateResponse = {
  __typename?: 'chat_messagesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Chat_Messages>;
};

export type Diaries = Node & {
  __typename?: 'diaries';
  content: Scalars['String']['output'];
  created_at: Scalars['Datetime']['output'];
  date: Scalars['Date']['output'];
  id: Scalars['UUID']['output'];
  mode: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  title?: Maybe<Scalars['String']['output']>;
  trip_id: Scalars['UUID']['output'];
  trips?: Maybe<Trips>;
  updated_at: Scalars['Datetime']['output'];
};

export type DiariesConnection = {
  __typename?: 'diariesConnection';
  edges: Array<DiariesEdge>;
  pageInfo: PageInfo;
};

export type DiariesDeleteResponse = {
  __typename?: 'diariesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Diaries>;
};

export type DiariesEdge = {
  __typename?: 'diariesEdge';
  cursor: Scalars['String']['output'];
  node: Diaries;
};

export type DiariesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<DiariesFilter>>;
  content?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  date?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  mode?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<DiariesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<DiariesFilter>>;
  title?: InputMaybe<StringFilter>;
  trip_id?: InputMaybe<UuidFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type DiariesInsertInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type DiariesInsertResponse = {
  __typename?: 'diariesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Diaries>;
};

export type DiariesOrderBy = {
  content?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  date?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  mode?: InputMaybe<OrderByDirection>;
  title?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type DiariesUpdateInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  mode?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type DiariesUpdateResponse = {
  __typename?: 'diariesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Diaries>;
};

export type Exp_Ledger = Node & {
  __typename?: 'exp_ledger';
  created_at: Scalars['Datetime']['output'];
  event_type: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  points: Scalars['Int']['output'];
  trip_id?: Maybe<Scalars['UUID']['output']>;
  trips?: Maybe<Trips>;
  user_id: Scalars['UUID']['output'];
};

export type Exp_LedgerConnection = {
  __typename?: 'exp_ledgerConnection';
  edges: Array<Exp_LedgerEdge>;
  pageInfo: PageInfo;
};

export type Exp_LedgerDeleteResponse = {
  __typename?: 'exp_ledgerDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exp_Ledger>;
};

export type Exp_LedgerEdge = {
  __typename?: 'exp_ledgerEdge';
  cursor: Scalars['String']['output'];
  node: Exp_Ledger;
};

export type Exp_LedgerFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Exp_LedgerFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  event_type?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Exp_LedgerFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Exp_LedgerFilter>>;
  points?: InputMaybe<IntFilter>;
  trip_id?: InputMaybe<UuidFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type Exp_LedgerInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Exp_LedgerInsertResponse = {
  __typename?: 'exp_ledgerInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exp_Ledger>;
};

export type Exp_LedgerOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  event_type?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  points?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type Exp_LedgerUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  event_type?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type Exp_LedgerUpdateResponse = {
  __typename?: 'exp_ledgerUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Exp_Ledger>;
};

export type Meal_Logs = Node & {
  __typename?: 'meal_logs';
  amount: Scalars['Int']['output'];
  category: Scalars['String']['output'];
  created_at: Scalars['Datetime']['output'];
  id: Scalars['UUID']['output'];
  is_good_price: Scalars['Boolean']['output'];
  meal_slot_id?: Maybe<Scalars['UUID']['output']>;
  meal_slots?: Maybe<Meal_Slots>;
  memo?: Maybe<Scalars['String']['output']>;
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  ocr_raw?: Maybe<Scalars['JSON']['output']>;
  receipt_image_url?: Maybe<Scalars['String']['output']>;
  restaurant_id?: Maybe<Scalars['UUID']['output']>;
  restaurants?: Maybe<Restaurants>;
  source: Scalars['String']['output'];
  store_address?: Maybe<Scalars['String']['output']>;
  store_latitude?: Maybe<Scalars['BigFloat']['output']>;
  store_longitude?: Maybe<Scalars['BigFloat']['output']>;
  store_name?: Maybe<Scalars['String']['output']>;
  trip_id: Scalars['UUID']['output'];
  trips?: Maybe<Trips>;
  updated_at: Scalars['Datetime']['output'];
  visit_date: Scalars['Date']['output'];
};

export type Meal_LogsConnection = {
  __typename?: 'meal_logsConnection';
  edges: Array<Meal_LogsEdge>;
  pageInfo: PageInfo;
};

export type Meal_LogsDeleteResponse = {
  __typename?: 'meal_logsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Logs>;
};

export type Meal_LogsEdge = {
  __typename?: 'meal_logsEdge';
  cursor: Scalars['String']['output'];
  node: Meal_Logs;
};

export type Meal_LogsFilter = {
  amount?: InputMaybe<IntFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Meal_LogsFilter>>;
  category?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  id?: InputMaybe<UuidFilter>;
  is_good_price?: InputMaybe<BooleanFilter>;
  meal_slot_id?: InputMaybe<UuidFilter>;
  memo?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Meal_LogsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Meal_LogsFilter>>;
  receipt_image_url?: InputMaybe<StringFilter>;
  restaurant_id?: InputMaybe<UuidFilter>;
  source?: InputMaybe<StringFilter>;
  store_address?: InputMaybe<StringFilter>;
  store_latitude?: InputMaybe<BigFloatFilter>;
  store_longitude?: InputMaybe<BigFloatFilter>;
  store_name?: InputMaybe<StringFilter>;
  trip_id?: InputMaybe<UuidFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  visit_date?: InputMaybe<DateFilter>;
};

export type Meal_LogsInsertInput = {
  amount?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_good_price?: InputMaybe<Scalars['Boolean']['input']>;
  meal_slot_id?: InputMaybe<Scalars['UUID']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
  ocr_raw?: InputMaybe<Scalars['JSON']['input']>;
  receipt_image_url?: InputMaybe<Scalars['String']['input']>;
  restaurant_id?: InputMaybe<Scalars['UUID']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  store_address?: InputMaybe<Scalars['String']['input']>;
  store_latitude?: InputMaybe<Scalars['BigFloat']['input']>;
  store_longitude?: InputMaybe<Scalars['BigFloat']['input']>;
  store_name?: InputMaybe<Scalars['String']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  visit_date?: InputMaybe<Scalars['Date']['input']>;
};

export type Meal_LogsInsertResponse = {
  __typename?: 'meal_logsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Logs>;
};

export type Meal_LogsOrderBy = {
  amount?: InputMaybe<OrderByDirection>;
  category?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_good_price?: InputMaybe<OrderByDirection>;
  meal_slot_id?: InputMaybe<OrderByDirection>;
  memo?: InputMaybe<OrderByDirection>;
  receipt_image_url?: InputMaybe<OrderByDirection>;
  restaurant_id?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  store_address?: InputMaybe<OrderByDirection>;
  store_latitude?: InputMaybe<OrderByDirection>;
  store_longitude?: InputMaybe<OrderByDirection>;
  store_name?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  visit_date?: InputMaybe<OrderByDirection>;
};

export type Meal_LogsUpdateInput = {
  amount?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_good_price?: InputMaybe<Scalars['Boolean']['input']>;
  meal_slot_id?: InputMaybe<Scalars['UUID']['input']>;
  memo?: InputMaybe<Scalars['String']['input']>;
  ocr_raw?: InputMaybe<Scalars['JSON']['input']>;
  receipt_image_url?: InputMaybe<Scalars['String']['input']>;
  restaurant_id?: InputMaybe<Scalars['UUID']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  store_address?: InputMaybe<Scalars['String']['input']>;
  store_latitude?: InputMaybe<Scalars['BigFloat']['input']>;
  store_longitude?: InputMaybe<Scalars['BigFloat']['input']>;
  store_name?: InputMaybe<Scalars['String']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  visit_date?: InputMaybe<Scalars['Date']['input']>;
};

export type Meal_LogsUpdateResponse = {
  __typename?: 'meal_logsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Logs>;
};

export type Meal_Slots = Node & {
  __typename?: 'meal_slots';
  budget_amount: Scalars['Int']['output'];
  carried_over_amount: Scalars['Int']['output'];
  confirmed_at?: Maybe<Scalars['Datetime']['output']>;
  created_at: Scalars['Datetime']['output'];
  date: Scalars['Date']['output'];
  id: Scalars['UUID']['output'];
  is_cascade_confirmed: Scalars['Boolean']['output'];
  is_recorded: Scalars['Boolean']['output'];
  meal_logsCollection?: Maybe<Meal_LogsConnection>;
  meal_type: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  recorded_amount?: Maybe<Scalars['Int']['output']>;
  trip_id: Scalars['UUID']['output'];
  trips?: Maybe<Trips>;
  updated_at: Scalars['Datetime']['output'];
  weight_level: Scalars['String']['output'];
};


export type Meal_SlotsMeal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_LogsOrderBy>>;
};

export type Meal_SlotsConnection = {
  __typename?: 'meal_slotsConnection';
  edges: Array<Meal_SlotsEdge>;
  pageInfo: PageInfo;
};

export type Meal_SlotsDeleteResponse = {
  __typename?: 'meal_slotsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Slots>;
};

export type Meal_SlotsEdge = {
  __typename?: 'meal_slotsEdge';
  cursor: Scalars['String']['output'];
  node: Meal_Slots;
};

export type Meal_SlotsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Meal_SlotsFilter>>;
  budget_amount?: InputMaybe<IntFilter>;
  carried_over_amount?: InputMaybe<IntFilter>;
  confirmed_at?: InputMaybe<DatetimeFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  date?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  is_cascade_confirmed?: InputMaybe<BooleanFilter>;
  is_recorded?: InputMaybe<BooleanFilter>;
  meal_type?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Meal_SlotsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Meal_SlotsFilter>>;
  recorded_amount?: InputMaybe<IntFilter>;
  trip_id?: InputMaybe<UuidFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  weight_level?: InputMaybe<StringFilter>;
};

export type Meal_SlotsInsertInput = {
  budget_amount?: InputMaybe<Scalars['Int']['input']>;
  carried_over_amount?: InputMaybe<Scalars['Int']['input']>;
  confirmed_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_cascade_confirmed?: InputMaybe<Scalars['Boolean']['input']>;
  is_recorded?: InputMaybe<Scalars['Boolean']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  recorded_amount?: InputMaybe<Scalars['Int']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  weight_level?: InputMaybe<Scalars['String']['input']>;
};

export type Meal_SlotsInsertResponse = {
  __typename?: 'meal_slotsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Slots>;
};

export type Meal_SlotsOrderBy = {
  budget_amount?: InputMaybe<OrderByDirection>;
  carried_over_amount?: InputMaybe<OrderByDirection>;
  confirmed_at?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  date?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  is_cascade_confirmed?: InputMaybe<OrderByDirection>;
  is_recorded?: InputMaybe<OrderByDirection>;
  meal_type?: InputMaybe<OrderByDirection>;
  recorded_amount?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  weight_level?: InputMaybe<OrderByDirection>;
};

export type Meal_SlotsUpdateInput = {
  budget_amount?: InputMaybe<Scalars['Int']['input']>;
  carried_over_amount?: InputMaybe<Scalars['Int']['input']>;
  confirmed_at?: InputMaybe<Scalars['Datetime']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  date?: InputMaybe<Scalars['Date']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  is_cascade_confirmed?: InputMaybe<Scalars['Boolean']['input']>;
  is_recorded?: InputMaybe<Scalars['Boolean']['input']>;
  meal_type?: InputMaybe<Scalars['String']['input']>;
  recorded_amount?: InputMaybe<Scalars['Int']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  weight_level?: InputMaybe<Scalars['String']['input']>;
};

export type Meal_SlotsUpdateResponse = {
  __typename?: 'meal_slotsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Meal_Slots>;
};

export type Profiles = Node & {
  __typename?: 'profiles';
  created_at: Scalars['Datetime']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  marketing_agreed: Scalars['Boolean']['output'];
  nickname: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
  terms_agreed_at?: Maybe<Scalars['Datetime']['output']>;
  updated_at: Scalars['Datetime']['output'];
};

export type ProfilesConnection = {
  __typename?: 'profilesConnection';
  edges: Array<ProfilesEdge>;
  pageInfo: PageInfo;
};

export type ProfilesDeleteResponse = {
  __typename?: 'profilesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesEdge = {
  __typename?: 'profilesEdge';
  cursor: Scalars['String']['output'];
  node: Profiles;
};

export type ProfilesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<ProfilesFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  handle?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  marketing_agreed?: InputMaybe<BooleanFilter>;
  nickname?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<ProfilesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<ProfilesFilter>>;
  status?: InputMaybe<StringFilter>;
  terms_agreed_at?: InputMaybe<DatetimeFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type ProfilesInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  marketing_agreed?: InputMaybe<Scalars['Boolean']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  terms_agreed_at?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ProfilesInsertResponse = {
  __typename?: 'profilesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type ProfilesOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  handle?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  marketing_agreed?: InputMaybe<OrderByDirection>;
  nickname?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  terms_agreed_at?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type ProfilesUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  handle?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  marketing_agreed?: InputMaybe<Scalars['Boolean']['input']>;
  nickname?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  terms_agreed_at?: InputMaybe<Scalars['Datetime']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type ProfilesUpdateResponse = {
  __typename?: 'profilesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Profiles>;
};

export type Region_Cache = Node & {
  __typename?: 'region_cache';
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  region_code: Scalars['String']['output'];
  region_name: Scalars['String']['output'];
  tour_api_snapshot?: Maybe<Scalars['JSON']['output']>;
};

export type Region_CacheConnection = {
  __typename?: 'region_cacheConnection';
  edges: Array<Region_CacheEdge>;
  pageInfo: PageInfo;
};

export type Region_CacheDeleteResponse = {
  __typename?: 'region_cacheDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Region_Cache>;
};

export type Region_CacheEdge = {
  __typename?: 'region_cacheEdge';
  cursor: Scalars['String']['output'];
  node: Region_Cache;
};

export type Region_CacheFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<Region_CacheFilter>>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<Region_CacheFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<Region_CacheFilter>>;
  region_code?: InputMaybe<StringFilter>;
  region_name?: InputMaybe<StringFilter>;
};

export type Region_CacheInsertInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  region_code?: InputMaybe<Scalars['String']['input']>;
  region_name?: InputMaybe<Scalars['String']['input']>;
  tour_api_snapshot?: InputMaybe<Scalars['JSON']['input']>;
};

export type Region_CacheInsertResponse = {
  __typename?: 'region_cacheInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Region_Cache>;
};

export type Region_CacheOrderBy = {
  id?: InputMaybe<OrderByDirection>;
  region_code?: InputMaybe<OrderByDirection>;
  region_name?: InputMaybe<OrderByDirection>;
};

export type Region_CacheUpdateInput = {
  id?: InputMaybe<Scalars['UUID']['input']>;
  region_code?: InputMaybe<Scalars['String']['input']>;
  region_name?: InputMaybe<Scalars['String']['input']>;
  tour_api_snapshot?: InputMaybe<Scalars['JSON']['input']>;
};

export type Region_CacheUpdateResponse = {
  __typename?: 'region_cacheUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Region_Cache>;
};

export type Restaurants = Node & {
  __typename?: 'restaurants';
  address: Scalars['String']['output'];
  business_hours?: Maybe<Scalars['JSON']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  cls_system2?: Maybe<Scalars['String']['output']>;
  cls_system3?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['Datetime']['output'];
  detail_synced_at?: Maybe<Scalars['Datetime']['output']>;
  external_id: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  last_synced_at: Scalars['Datetime']['output'];
  latitude?: Maybe<Scalars['BigFloat']['output']>;
  longitude?: Maybe<Scalars['BigFloat']['output']>;
  meal_logsCollection?: Maybe<Meal_LogsConnection>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  overview?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  price_menus?: Maybe<Scalars['JSON']['output']>;
  region_sido?: Maybe<Scalars['String']['output']>;
  region_sigungu?: Maybe<Scalars['String']['output']>;
  source: Scalars['String']['output'];
  updated_at: Scalars['Datetime']['output'];
};


export type RestaurantsMeal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_LogsOrderBy>>;
};

export type RestaurantsConnection = {
  __typename?: 'restaurantsConnection';
  edges: Array<RestaurantsEdge>;
  pageInfo: PageInfo;
};

export type RestaurantsDeleteResponse = {
  __typename?: 'restaurantsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Restaurants>;
};

export type RestaurantsEdge = {
  __typename?: 'restaurantsEdge';
  cursor: Scalars['String']['output'];
  node: Restaurants;
};

export type RestaurantsFilter = {
  address?: InputMaybe<StringFilter>;
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<RestaurantsFilter>>;
  category?: InputMaybe<StringFilter>;
  cls_system2?: InputMaybe<StringFilter>;
  cls_system3?: InputMaybe<StringFilter>;
  created_at?: InputMaybe<DatetimeFilter>;
  detail_synced_at?: InputMaybe<DatetimeFilter>;
  external_id?: InputMaybe<StringFilter>;
  id?: InputMaybe<UuidFilter>;
  image_url?: InputMaybe<StringFilter>;
  last_synced_at?: InputMaybe<DatetimeFilter>;
  latitude?: InputMaybe<BigFloatFilter>;
  longitude?: InputMaybe<BigFloatFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<RestaurantsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<RestaurantsFilter>>;
  overview?: InputMaybe<StringFilter>;
  phone?: InputMaybe<StringFilter>;
  region_sido?: InputMaybe<StringFilter>;
  region_sigungu?: InputMaybe<StringFilter>;
  source?: InputMaybe<StringFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
};

export type RestaurantsInsertInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  business_hours?: InputMaybe<Scalars['JSON']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  cls_system2?: InputMaybe<Scalars['String']['input']>;
  cls_system3?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  detail_synced_at?: InputMaybe<Scalars['Datetime']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  last_synced_at?: InputMaybe<Scalars['Datetime']['input']>;
  latitude?: InputMaybe<Scalars['BigFloat']['input']>;
  longitude?: InputMaybe<Scalars['BigFloat']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  overview?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  price_menus?: InputMaybe<Scalars['JSON']['input']>;
  region_sido?: InputMaybe<Scalars['String']['input']>;
  region_sigungu?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type RestaurantsInsertResponse = {
  __typename?: 'restaurantsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Restaurants>;
};

export type RestaurantsOrderBy = {
  address?: InputMaybe<OrderByDirection>;
  category?: InputMaybe<OrderByDirection>;
  cls_system2?: InputMaybe<OrderByDirection>;
  cls_system3?: InputMaybe<OrderByDirection>;
  created_at?: InputMaybe<OrderByDirection>;
  detail_synced_at?: InputMaybe<OrderByDirection>;
  external_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  image_url?: InputMaybe<OrderByDirection>;
  last_synced_at?: InputMaybe<OrderByDirection>;
  latitude?: InputMaybe<OrderByDirection>;
  longitude?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  overview?: InputMaybe<OrderByDirection>;
  phone?: InputMaybe<OrderByDirection>;
  region_sido?: InputMaybe<OrderByDirection>;
  region_sigungu?: InputMaybe<OrderByDirection>;
  source?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
};

export type RestaurantsUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  business_hours?: InputMaybe<Scalars['JSON']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  cls_system2?: InputMaybe<Scalars['String']['input']>;
  cls_system3?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  detail_synced_at?: InputMaybe<Scalars['Datetime']['input']>;
  external_id?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  last_synced_at?: InputMaybe<Scalars['Datetime']['input']>;
  latitude?: InputMaybe<Scalars['BigFloat']['input']>;
  longitude?: InputMaybe<Scalars['BigFloat']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  overview?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  price_menus?: InputMaybe<Scalars['JSON']['input']>;
  region_sido?: InputMaybe<Scalars['String']['input']>;
  region_sigungu?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
};

export type RestaurantsUpdateResponse = {
  __typename?: 'restaurantsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Restaurants>;
};

export type Trips = Node & {
  __typename?: 'trips';
  budget_change_historyCollection?: Maybe<Budget_Change_HistoryConnection>;
  chat_messagesCollection?: Maybe<Chat_MessagesConnection>;
  created_at: Scalars['Datetime']['output'];
  diariesCollection?: Maybe<DiariesConnection>;
  end_date: Scalars['Date']['output'];
  exp_ledgerCollection?: Maybe<Exp_LedgerConnection>;
  fixed_cost: Scalars['Int']['output'];
  floating_budget: Scalars['Int']['output'];
  food_budget_ratio: Scalars['BigFloat']['output'];
  id: Scalars['UUID']['output'];
  meal_logsCollection?: Maybe<Meal_LogsConnection>;
  meal_slotsCollection?: Maybe<Meal_SlotsConnection>;
  name: Scalars['String']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  region_code: Scalars['String']['output'];
  start_date: Scalars['Date']['output'];
  status: Scalars['String']['output'];
  total_budget: Scalars['Int']['output'];
  updated_at: Scalars['Datetime']['output'];
  user_badgesCollection?: Maybe<User_BadgesConnection>;
  user_id: Scalars['UUID']['output'];
};


export type TripsBudget_Change_HistoryCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Budget_Change_HistoryFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Budget_Change_HistoryOrderBy>>;
};


export type TripsChat_MessagesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Chat_MessagesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Chat_MessagesOrderBy>>;
};


export type TripsDiariesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<DiariesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<DiariesOrderBy>>;
};


export type TripsExp_LedgerCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Exp_LedgerFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Exp_LedgerOrderBy>>;
};


export type TripsMeal_LogsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_LogsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_LogsOrderBy>>;
};


export type TripsMeal_SlotsCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<Meal_SlotsFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<Meal_SlotsOrderBy>>;
};


export type TripsUser_BadgesCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filter?: InputMaybe<User_BadgesFilter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Array<User_BadgesOrderBy>>;
};

export type TripsConnection = {
  __typename?: 'tripsConnection';
  edges: Array<TripsEdge>;
  pageInfo: PageInfo;
};

export type TripsDeleteResponse = {
  __typename?: 'tripsDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Trips>;
};

export type TripsEdge = {
  __typename?: 'tripsEdge';
  cursor: Scalars['String']['output'];
  node: Trips;
};

export type TripsFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<TripsFilter>>;
  created_at?: InputMaybe<DatetimeFilter>;
  end_date?: InputMaybe<DateFilter>;
  fixed_cost?: InputMaybe<IntFilter>;
  floating_budget?: InputMaybe<IntFilter>;
  food_budget_ratio?: InputMaybe<BigFloatFilter>;
  id?: InputMaybe<UuidFilter>;
  name?: InputMaybe<StringFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<TripsFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<TripsFilter>>;
  region_code?: InputMaybe<StringFilter>;
  start_date?: InputMaybe<DateFilter>;
  status?: InputMaybe<StringFilter>;
  total_budget?: InputMaybe<IntFilter>;
  updated_at?: InputMaybe<DatetimeFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type TripsInsertInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  fixed_cost?: InputMaybe<Scalars['Int']['input']>;
  floating_budget?: InputMaybe<Scalars['Int']['input']>;
  food_budget_ratio?: InputMaybe<Scalars['BigFloat']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  region_code?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total_budget?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type TripsInsertResponse = {
  __typename?: 'tripsInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Trips>;
};

export type TripsOrderBy = {
  created_at?: InputMaybe<OrderByDirection>;
  end_date?: InputMaybe<OrderByDirection>;
  fixed_cost?: InputMaybe<OrderByDirection>;
  floating_budget?: InputMaybe<OrderByDirection>;
  food_budget_ratio?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  name?: InputMaybe<OrderByDirection>;
  region_code?: InputMaybe<OrderByDirection>;
  start_date?: InputMaybe<OrderByDirection>;
  status?: InputMaybe<OrderByDirection>;
  total_budget?: InputMaybe<OrderByDirection>;
  updated_at?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type TripsUpdateInput = {
  created_at?: InputMaybe<Scalars['Datetime']['input']>;
  end_date?: InputMaybe<Scalars['Date']['input']>;
  fixed_cost?: InputMaybe<Scalars['Int']['input']>;
  floating_budget?: InputMaybe<Scalars['Int']['input']>;
  food_budget_ratio?: InputMaybe<Scalars['BigFloat']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  region_code?: InputMaybe<Scalars['String']['input']>;
  start_date?: InputMaybe<Scalars['Date']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  total_budget?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['Datetime']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type TripsUpdateResponse = {
  __typename?: 'tripsUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<Trips>;
};

export type User_Badges = Node & {
  __typename?: 'user_badges';
  awarded_at: Scalars['Datetime']['output'];
  badge_id: Scalars['UUID']['output'];
  badges?: Maybe<Badges>;
  id: Scalars['UUID']['output'];
  /** Globally Unique Record Identifier */
  nodeId: Scalars['ID']['output'];
  trip_id: Scalars['UUID']['output'];
  trips?: Maybe<Trips>;
  user_id: Scalars['UUID']['output'];
};

export type User_BadgesConnection = {
  __typename?: 'user_badgesConnection';
  edges: Array<User_BadgesEdge>;
  pageInfo: PageInfo;
};

export type User_BadgesDeleteResponse = {
  __typename?: 'user_badgesDeleteResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Badges>;
};

export type User_BadgesEdge = {
  __typename?: 'user_badgesEdge';
  cursor: Scalars['String']['output'];
  node: User_Badges;
};

export type User_BadgesFilter = {
  /** Returns true only if all its inner filters are true, otherwise returns false */
  and?: InputMaybe<Array<User_BadgesFilter>>;
  awarded_at?: InputMaybe<DatetimeFilter>;
  badge_id?: InputMaybe<UuidFilter>;
  id?: InputMaybe<UuidFilter>;
  nodeId?: InputMaybe<IdFilter>;
  /** Negates a filter */
  not?: InputMaybe<User_BadgesFilter>;
  /** Returns true if at least one of its inner filters is true, otherwise returns false */
  or?: InputMaybe<Array<User_BadgesFilter>>;
  trip_id?: InputMaybe<UuidFilter>;
  user_id?: InputMaybe<UuidFilter>;
};

export type User_BadgesInsertInput = {
  awarded_at?: InputMaybe<Scalars['Datetime']['input']>;
  badge_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_BadgesInsertResponse = {
  __typename?: 'user_badgesInsertResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Badges>;
};

export type User_BadgesOrderBy = {
  awarded_at?: InputMaybe<OrderByDirection>;
  badge_id?: InputMaybe<OrderByDirection>;
  id?: InputMaybe<OrderByDirection>;
  trip_id?: InputMaybe<OrderByDirection>;
  user_id?: InputMaybe<OrderByDirection>;
};

export type User_BadgesUpdateInput = {
  awarded_at?: InputMaybe<Scalars['Datetime']['input']>;
  badge_id?: InputMaybe<Scalars['UUID']['input']>;
  id?: InputMaybe<Scalars['UUID']['input']>;
  trip_id?: InputMaybe<Scalars['UUID']['input']>;
  user_id?: InputMaybe<Scalars['UUID']['input']>;
};

export type User_BadgesUpdateResponse = {
  __typename?: 'user_badgesUpdateResponse';
  /** Count of the records impacted by the mutation */
  affectedCount: Scalars['Int']['output'];
  /** Array of records impacted by the mutation */
  records: Array<User_Badges>;
};

export type AgreeToSignUpTermsMutationVariables = Exact<{
  id: string;
  agreedAt: string;
  marketingAgreed: boolean;
}>;


export type AgreeToSignUpTermsMutation = { updateprofilesCollection: { affectedCount: number, records: Array<{ id: string, terms_agreed_at: string | null, marketing_agreed: boolean }> } };

export type EditTripBudgetMutationVariables = Exact<{
  tripId: string;
  name: string;
  totalBudget: number;
  fixedCost: number;
  floatingBudget: number;
  slotIds: Array<string | null | undefined> | string;
  slotAmounts: Array<number | null | undefined> | number;
}>;


export type EditTripBudgetMutation = { edit_trip_budget: { id: string, name: string, total_budget: number, fixed_cost: number, floating_budget: number, status: string } | null };

export type RegionNameQueryVariables = Exact<{
  code: string;
}>;


export type RegionNameQuery = { region_cacheCollection: { edges: Array<{ node: { region_name: string } }> } };

export type ActiveTripQueryVariables = Exact<{
  userId: string;
}>;


export type ActiveTripQuery = { tripsCollection: { edges: Array<{ node: { id: string, name: string, region_code: string, start_date: string, end_date: string, total_budget: number, fixed_cost: number, food_budget_ratio: number, floating_budget: number, status: string, meal_slotsCollection: { edges: Array<{ node: { id: string, date: string, meal_type: string, weight_level: string, budget_amount: number, carried_over_amount: number, is_recorded: boolean, is_cascade_confirmed: boolean, recorded_amount: number | null } }> } | null } }> } };

export type CreateTripWithMealSlotsMutationVariables = Exact<{
  name: string;
  regionCode: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  fixedCost: number;
  foodBudgetRatio: string;
  floatingBudget: number;
  dates: Array<string | null | undefined> | string;
  mealTypes: Array<string | null | undefined> | string;
  weightLevels: Array<string | null | undefined> | string;
  budgetAmounts: Array<number | null | undefined> | number;
}>;


export type CreateTripWithMealSlotsMutation = { create_trip_with_meal_slots: { id: string, name: string, region_code: string, start_date: string, end_date: string, status: string } | null };

export type UpdateMealSlotWeightMutationVariables = Exact<{
  slotIds: Array<string | null | undefined> | string;
  budgetAmounts: Array<number | null | undefined> | number;
  weightLevels: Array<string | null | undefined> | string;
}>;


export type UpdateMealSlotWeightMutation = { apply_meal_slot_budgets: unknown };

export type ChatMealLogsQueryVariables = Exact<{
  tripId: string;
}>;


export type ChatMealLogsQuery = { meal_logsCollection: { edges: Array<{ node: { id: string, category: string, amount: number, store_name: string | null, memo: string | null, created_at: string } }> } };

export type InsertChatMessageMutationVariables = Exact<{
  tripId: string;
  userId: string;
  role: string;
  content: string;
  parsedCategory?: string | null | undefined;
  parsedAmount?: number | null | undefined;
  status: string;
}>;


export type InsertChatMessageMutation = { insertIntochat_messagesCollection: { affectedCount: number, records: Array<{ id: string, status: string }> } | null };

export type UpdateChatMessageStatusMutationVariables = Exact<{
  id: string;
  status: string;
}>;


export type UpdateChatMessageStatusMutation = { updatechat_messagesCollection: { affectedCount: number, records: Array<{ id: string, status: string }> } };

export type CreateDiaryMutationVariables = Exact<{
  tripId: string;
  date: string;
  mode: string;
  title?: string | null | undefined;
  content: string;
}>;


export type CreateDiaryMutation = { insertIntodiariesCollection: { records: Array<{ id: string }> } | null };

export type DiaryByDateQueryVariables = Exact<{
  tripId: string;
  date: string;
}>;


export type DiaryByDateQuery = { diariesCollection: { edges: Array<{ node: { id: string, title: string | null, content: string, mode: string } }> } };

export type UpdateDiaryMutationVariables = Exact<{
  diaryId: string;
  mode: string;
  title?: string | null | undefined;
  content: string;
}>;


export type UpdateDiaryMutation = { updatediariesCollection: { affectedCount: number } };

export type ProfileQueryVariables = Exact<{
  id: string;
}>;


export type ProfileQuery = { profilesByPk: { id: string, nickname: string, handle: string, terms_agreed_at: string | null, marketing_agreed: boolean } | null };

export type CreateMealLogMutationVariables = Exact<{
  tripId: string;
  mealSlotId?: string | null | undefined;
  category: string;
  amount: number;
  storeName?: string | null | undefined;
  storeAddress?: string | null | undefined;
  memo?: string | null | undefined;
  source: string;
  visitDate: string;
}>;


export type CreateMealLogMutation = { insertIntomeal_logsCollection: { affectedCount: number, records: Array<{ id: string, trip_id: string, meal_slot_id: string | null, category: string, amount: number, store_name: string | null, store_address: string | null, memo: string | null, source: string, visit_date: string, created_at: string }> } | null };

export type DeleteMealLogMutationVariables = Exact<{
  mealLogId: string;
}>;


export type DeleteMealLogMutation = { delete_meal_log: unknown };

export type MealSlotQueryVariables = Exact<{
  id: string;
}>;


export type MealSlotQuery = { meal_slotsByPk: { id: string, trip_id: string, date: string, meal_type: string, weight_level: string, budget_amount: number, carried_over_amount: number, is_recorded: boolean, is_cascade_confirmed: boolean, recorded_amount: number | null } | null };

export type RecordMealLogMutationVariables = Exact<{
  tripId: string;
  mealSlotId: string;
  amount: number;
  storeName?: string | null | undefined;
  storeAddress?: string | null | undefined;
  memo?: string | null | undefined;
  source: string;
}>;


export type RecordMealLogMutation = { record_meal_log: { id: string, trip_id: string, meal_slot_id: string | null, category: string, amount: number, store_name: string | null, store_address: string | null, memo: string | null, source: string, visit_date: string, created_at: string } | null };

export type SetMealLogReceiptMutationVariables = Exact<{
  mealLogId: string;
  receiptImageUrl?: string | null | undefined;
  ocrRaw?: unknown;
}>;


export type SetMealLogReceiptMutation = { updatemeal_logsCollection: { affectedCount: number } };

export type TripBudgetHistoryQueryVariables = Exact<{
  tripId: string;
}>;


export type TripBudgetHistoryQuery = { tripsCollection: { edges: Array<{ node: { id: string, floating_budget: number, budget_change_historyCollection: { edges: Array<{ node: { id: string, event_type: string, amount_delta: number, before_json: unknown, after_json: unknown, created_at: string } }> } | null } }> } };

export type TripHistoryQueryVariables = Exact<{
  tripId: string;
}>;


export type TripHistoryQuery = { tripsCollection: { edges: Array<{ node: { id: string, name: string, meal_slotsCollection: { edges: Array<{ node: { id: string, date: string, meal_type: string, is_recorded: boolean } }> } | null } }> } };

export type TripMealLogsQueryVariables = Exact<{
  tripId: string;
}>;


export type TripMealLogsQuery = { meal_logsCollection: { edges: Array<{ node: { id: string, meal_slot_id: string | null, category: string, amount: number, store_name: string | null, store_address: string | null, memo: string | null, source: string, visit_date: string, created_at: string, meal_slots: { date: string } | null } }> } };

export type UpdateMealLogMutationVariables = Exact<{
  mealLogId: string;
  amount: number;
  storeName?: string | null | undefined;
  storeAddress?: string | null | undefined;
  memo?: string | null | undefined;
  category?: string | null | undefined;
}>;


export type UpdateMealLogMutation = { update_meal_log: { id: string, trip_id: string, meal_slot_id: string | null, category: string, amount: number, store_name: string | null, store_address: string | null, memo: string | null, source: string, created_at: string } | null };

export type UserTripsQueryVariables = Exact<{
  userId: string;
}>;


export type UserTripsQuery = { tripsCollection: { edges: Array<{ node: { id: string, name: string, start_date: string, end_date: string, status: string } }> } };

export type RegionsQueryVariables = Exact<{ [key: string]: never; }>;


export type RegionsQuery = { region_cacheCollection: { edges: Array<{ node: { id: string, region_code: string, region_name: string } }> } };


export const AgreeToSignUpTermsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AgreeToSignUpTerms"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"agreedAt"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Datetime"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"marketingAgreed"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateprofilesCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"set"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"terms_agreed_at"},"value":{"kind":"Variable","name":{"kind":"Name","value":"agreedAt"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"marketing_agreed"},"value":{"kind":"Variable","name":{"kind":"Name","value":"marketingAgreed"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"affectedCount"}},{"kind":"Field","name":{"kind":"Name","value":"records"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"terms_agreed_at"}},{"kind":"Field","name":{"kind":"Name","value":"marketing_agreed"}}]}}]}}]}}]} as unknown as DocumentNode<AgreeToSignUpTermsMutation, AgreeToSignUpTermsMutationVariables>;
export const EditTripBudgetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EditTripBudget"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fixedCost"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"floatingBudget"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slotIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slotAmounts"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edit_trip_budget"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"p_trip_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_total_budget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_fixed_cost"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fixedCost"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_floating_budget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"floatingBudget"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_slot_ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slotIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_slot_amounts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slotAmounts"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"total_budget"}},{"kind":"Field","name":{"kind":"Name","value":"fixed_cost"}},{"kind":"Field","name":{"kind":"Name","value":"floating_budget"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<EditTripBudgetMutation, EditTripBudgetMutationVariables>;
export const RegionNameDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RegionName"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"code"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"region_cacheCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"region_code"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"code"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"region_name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RegionNameQuery, RegionNameQueryVariables>;
export const ActiveTripDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveTrip"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"user_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"StringValue","value":"ongoing","block":false}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"DescNullsLast"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"region_code"}},{"kind":"Field","name":{"kind":"Name","value":"start_date"}},{"kind":"Field","name":{"kind":"Name","value":"end_date"}},{"kind":"Field","name":{"kind":"Name","value":"total_budget"}},{"kind":"Field","name":{"kind":"Name","value":"fixed_cost"}},{"kind":"Field","name":{"kind":"Name","value":"food_budget_ratio"}},{"kind":"Field","name":{"kind":"Name","value":"floating_budget"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slotsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"meal_type"}},{"kind":"Field","name":{"kind":"Name","value":"weight_level"}},{"kind":"Field","name":{"kind":"Name","value":"budget_amount"}},{"kind":"Field","name":{"kind":"Name","value":"carried_over_amount"}},{"kind":"Field","name":{"kind":"Name","value":"is_recorded"}},{"kind":"Field","name":{"kind":"Name","value":"is_cascade_confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"recorded_amount"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<ActiveTripQuery, ActiveTripQueryVariables>;
export const CreateTripWithMealSlotsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTripWithMealSlots"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"regionCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"fixedCost"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"foodBudgetRatio"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigFloat"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"floatingBudget"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"dates"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealTypes"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weightLevels"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"budgetAmounts"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"create_trip_with_meal_slots"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"p_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_region_code"},"value":{"kind":"Variable","name":{"kind":"Name","value":"regionCode"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_start_date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"startDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_end_date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"endDate"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_total_budget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"totalBudget"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_fixed_cost"},"value":{"kind":"Variable","name":{"kind":"Name","value":"fixedCost"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_food_budget_ratio"},"value":{"kind":"Variable","name":{"kind":"Name","value":"foodBudgetRatio"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_floating_budget"},"value":{"kind":"Variable","name":{"kind":"Name","value":"floatingBudget"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_dates"},"value":{"kind":"Variable","name":{"kind":"Name","value":"dates"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_meal_types"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealTypes"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_weight_levels"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weightLevels"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_budget_amounts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"budgetAmounts"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"region_code"}},{"kind":"Field","name":{"kind":"Name","value":"start_date"}},{"kind":"Field","name":{"kind":"Name","value":"end_date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<CreateTripWithMealSlotsMutation, CreateTripWithMealSlotsMutationVariables>;
export const UpdateMealSlotWeightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMealSlotWeight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slotIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"budgetAmounts"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weightLevels"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"apply_meal_slot_budgets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"p_slot_ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slotIds"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_budget_amounts"},"value":{"kind":"Variable","name":{"kind":"Name","value":"budgetAmounts"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_weight_levels"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weightLevels"}}}]}]}}]} as unknown as DocumentNode<UpdateMealSlotWeightMutation, UpdateMealSlotWeightMutationVariables>;
export const ChatMealLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ChatMealLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meal_logsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"trip_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"source"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"StringValue","value":"chat","block":false}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"DescNullsLast"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"500"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"store_name"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ChatMealLogsQuery, ChatMealLogsQueryVariables>;
export const InsertChatMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InsertChatMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parsedCategory"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parsedAmount"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"insertIntochat_messagesCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objects"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"trip_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"parsed_category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parsedCategory"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"parsed_amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parsedAmount"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"affectedCount"}},{"kind":"Field","name":{"kind":"Name","value":"records"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<InsertChatMessageMutation, InsertChatMessageMutationVariables>;
export const UpdateChatMessageStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateChatMessageStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatechat_messagesCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"set"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"affectedCount"}},{"kind":"Field","name":{"kind":"Name","value":"records"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateChatMessageStatusMutation, UpdateChatMessageStatusMutationVariables>;
export const CreateDiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"insertIntodiariesCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objects"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"trip_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"mode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mode"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"records"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateDiaryMutation, CreateDiaryMutationVariables>;
export const DiaryByDateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DiaryByDate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"diariesCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"trip_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}}]}},{"kind":"ObjectField","name":{"kind":"Name","value":"date"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"mode"}}]}}]}}]}}]}}]} as unknown as DocumentNode<DiaryByDateQuery, DiaryByDateQueryVariables>;
export const UpdateDiaryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDiary"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"diaryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatediariesCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"set"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"mode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mode"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"diaryId"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"affectedCount"}}]}}]}}]} as unknown as DocumentNode<UpdateDiaryMutation, UpdateDiaryMutationVariables>;
export const ProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Profile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"profilesByPk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nickname"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"terms_agreed_at"}},{"kind":"Field","name":{"kind":"Name","value":"marketing_agreed"}}]}}]}}]} as unknown as DocumentNode<ProfileQuery, ProfileQueryVariables>;
export const CreateMealLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMealLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealSlotId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"source"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"visitDate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Date"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"insertIntomeal_logsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"objects"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"trip_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"meal_slot_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealSlotId"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"store_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeName"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"store_address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeAddress"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"memo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memo"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"source"},"value":{"kind":"Variable","name":{"kind":"Name","value":"source"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"visit_date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"visitDate"}}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"affectedCount"}},{"kind":"Field","name":{"kind":"Name","value":"records"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trip_id"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slot_id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"store_name"}},{"kind":"Field","name":{"kind":"Name","value":"store_address"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"visit_date"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]}}]} as unknown as DocumentNode<CreateMealLogMutation, CreateMealLogMutationVariables>;
export const DeleteMealLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMealLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealLogId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"delete_meal_log"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"p_meal_log_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealLogId"}}}]}]}}]} as unknown as DocumentNode<DeleteMealLogMutation, DeleteMealLogMutationVariables>;
export const MealSlotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MealSlot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meal_slotsByPk"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trip_id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"meal_type"}},{"kind":"Field","name":{"kind":"Name","value":"weight_level"}},{"kind":"Field","name":{"kind":"Name","value":"budget_amount"}},{"kind":"Field","name":{"kind":"Name","value":"carried_over_amount"}},{"kind":"Field","name":{"kind":"Name","value":"is_recorded"}},{"kind":"Field","name":{"kind":"Name","value":"is_cascade_confirmed"}},{"kind":"Field","name":{"kind":"Name","value":"recorded_amount"}}]}}]}}]} as unknown as DocumentNode<MealSlotQuery, MealSlotQueryVariables>;
export const RecordMealLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordMealLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealSlotId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"source"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"record_meal_log"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"p_trip_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_meal_slot_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealSlotId"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_store_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeName"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_store_address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeAddress"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_memo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memo"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_source"},"value":{"kind":"Variable","name":{"kind":"Name","value":"source"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trip_id"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slot_id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"store_name"}},{"kind":"Field","name":{"kind":"Name","value":"store_address"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"visit_date"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<RecordMealLogMutation, RecordMealLogMutationVariables>;
export const SetMealLogReceiptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetMealLogReceipt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealLogId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"receiptImageUrl"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ocrRaw"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"JSON"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatemeal_logsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"set"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"receipt_image_url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"receiptImageUrl"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"ocr_raw"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ocrRaw"}}}]}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealLogId"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"affectedCount"}}]}}]}}]} as unknown as DocumentNode<SetMealLogReceiptMutation, SetMealLogReceiptMutationVariables>;
export const TripBudgetHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TripBudgetHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"floating_budget"}},{"kind":"Field","name":{"kind":"Name","value":"budget_change_historyCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"AscNullsFirst"}}]}]}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"amount_delta"}},{"kind":"Field","name":{"kind":"Name","value":"before_json"}},{"kind":"Field","name":{"kind":"Name","value":"after_json"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TripBudgetHistoryQuery, TripBudgetHistoryQueryVariables>;
export const TripHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TripHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}}]}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slotsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"meal_type"}},{"kind":"Field","name":{"kind":"Name","value":"is_recorded"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TripHistoryQuery, TripHistoryQueryVariables>;
export const TripMealLogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TripMealLogs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"meal_logsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"trip_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tripId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"DescNullsLast"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slot_id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"store_name"}},{"kind":"Field","name":{"kind":"Name","value":"store_address"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"visit_date"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<TripMealLogsQuery, TripMealLogsQueryVariables>;
export const UpdateMealLogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMealLog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mealLogId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"storeAddress"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memo"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"update_meal_log"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"p_meal_log_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mealLogId"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_store_name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeName"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_store_address"},"value":{"kind":"Variable","name":{"kind":"Name","value":"storeAddress"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_memo"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memo"}}},{"kind":"Argument","name":{"kind":"Name","value":"p_category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trip_id"}},{"kind":"Field","name":{"kind":"Name","value":"meal_slot_id"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"store_name"}},{"kind":"Field","name":{"kind":"Name","value":"store_address"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<UpdateMealLogMutation, UpdateMealLogMutationVariables>;
export const UserTripsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UserTrips"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tripsCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"user_id"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"eq"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}]}}]}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"ListValue","values":[{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"start_date"},"value":{"kind":"EnumValue","value":"DescNullsLast"}}]}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"start_date"}},{"kind":"Field","name":{"kind":"Name","value":"end_date"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UserTripsQuery, UserTripsQueryVariables>;
export const RegionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Regions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"region_cacheCollection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"region_code"}},{"kind":"Field","name":{"kind":"Name","value":"region_name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<RegionsQuery, RegionsQueryVariables>;