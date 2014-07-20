# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20140720184901) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "access_codes", force: true do |t|
    t.string   "name"
    t.string   "code"
    t.boolean  "expires"
    t.datetime "start_date"
    t.datetime "end_date"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "favorites", force: true do |t|
    t.integer  "media_id"
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "favorites", ["media_id"], name: "index_favorites_on_media_id", using: :btree
  add_index "favorites", ["user_id"], name: "index_favorites_on_user_id", using: :btree

  create_table "media", force: true do |t|
    t.string   "remote_id"
    t.string   "remote_provider"
    t.datetime "remote_created_at"
    t.string   "image_link_original"
    t.text     "title"
    t.text     "description"
    t.string   "content_type"
    t.boolean  "animated"
    t.integer  "width"
    t.integer  "height"
    t.integer  "size"
    t.integer  "remote_views"
    t.integer  "bandwidth"
    t.string   "delete_hash"
    t.string   "section"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "viral",                default: false
    t.string   "image_link_tiny"
    t.string   "image_link_thumbnail"
    t.string   "image_link_medium"
    t.string   "image_link_large"
    t.integer  "remote_up_votes"
    t.integer  "remote_down_votes"
    t.integer  "remote_score"
    t.integer  "ts_score",             default: 0,         null: false
    t.datetime "last_touched"
    t.string   "image_link_huge"
    t.boolean  "repopulate_score",     default: true,      null: false
    t.boolean  "time_bonus_expired",   default: false,     null: false
    t.string   "ts_type",              default: "content", null: false
    t.boolean  "reported",             default: false,     null: false
    t.boolean  "nsfw",                 default: false,     null: false
  end

  add_index "media", ["nsfw"], name: "index_media_on_nsfw", using: :btree
  add_index "media", ["remote_id"], name: "index_media_on_remote_id", unique: true, using: :btree
  add_index "media", ["repopulate_score"], name: "index_media_on_repopulate_score", using: :btree
  add_index "media", ["reported"], name: "index_media_on_reported", using: :btree
  add_index "media", ["ts_type"], name: "index_media_on_ts_type", using: :btree
  add_index "media", ["viral"], name: "index_media_on_viral", using: :btree

  create_table "taggings", force: true do |t|
    t.integer  "tag_id"
    t.integer  "taggable_id"
    t.string   "taggable_type"
    t.integer  "tagger_id"
    t.string   "tagger_type"
    t.string   "context",       limit: 128
    t.datetime "created_at"
  end

  add_index "taggings", ["tag_id", "taggable_id", "taggable_type", "context", "tagger_id", "tagger_type"], name: "taggings_idx", unique: true, using: :btree

  create_table "tags", force: true do |t|
    t.string  "name"
    t.boolean "fetch_more_content", default: true,  null: false
    t.boolean "blacklisted",        default: false, null: false
    t.integer "created_by"
  end

  add_index "tags", ["name"], name: "index_tags_on_name", unique: true, using: :btree

  create_table "users", force: true do |t|
    t.string   "email",                  default: "",    null: false
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,     null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "provider"
    t.string   "uid"
    t.string   "username"
    t.string   "imgur_refresh_token"
    t.string   "imgur_auth_token"
    t.datetime "imgur_token_created_at"
    t.datetime "imgur_token_expires_at"
    t.boolean  "imgur_pro_expiration"
    t.boolean  "active"
    t.boolean  "beta_user"
    t.boolean  "admin",                  default: false
    t.integer  "access_code_id"
    t.boolean  "beta_tester_agreement",  default: false, null: false
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.boolean  "completed_feature_tour", default: false
    t.string   "slug"
    t.boolean  "safe_mode",              default: true,  null: false
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true, using: :btree
  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree
  add_index "users", ["slug"], name: "index_users_on_slug", unique: true, using: :btree

  create_table "votes", force: true do |t|
    t.integer  "votable_id"
    t.string   "votable_type"
    t.integer  "voter_id"
    t.string   "voter_type"
    t.boolean  "vote_flag"
    t.string   "vote_tag"
    t.integer  "vote_weight"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "tag_id"
    t.string   "cached_tag_name"
  end

  add_index "votes", ["cached_tag_name"], name: "index_votes_on_cached_tag_name", using: :btree
  add_index "votes", ["tag_id"], name: "index_votes_on_tag_id", using: :btree
  add_index "votes", ["votable_id", "votable_type", "vote_tag"], name: "index_votes_on_votable_id_and_votable_type_and_vote_tag", using: :btree
  add_index "votes", ["vote_tag"], name: "index_votes_on_vote_tag", using: :btree
  add_index "votes", ["voter_id", "votable_id", "votable_type"], name: "index_votes_on_voter_id_and_votable_id_and_votable_type", unique: true, using: :btree
  add_index "votes", ["voter_id", "voter_type", "vote_tag"], name: "index_votes_on_voter_id_and_voter_type_and_vote_tag", using: :btree

end
