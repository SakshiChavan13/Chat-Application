<?php

namespace App\Observers;

use App\Models\Group;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Support\Facades\Storage;

class MessageObserver
{
    public function deleting($message)
    {

        $message->attachments()->each(function ($attachment) {
            // Delete the attachment file from storage
            $dir = dirname($attachment->path);
            Storage::disk('public')->deleteDirectory($dir);
            // Delete the attachment record from the database

        });
        $message->attachments()->delete();

        if ($message->group_id) {
            $group = Group::where('last_message_id', $message->id)->first();

            if ($group) {
                $prevMessage = Message::where('group_id', $group->id)
                    ->where('id', '!=', $message->id)
                    ->orderBy('created_at', 'desc')
                    ->limit(1)
                    ->first();

                if ($prevMessage) {
                    $group->last_message_id = $prevMessage->id;
                    $group->save();
                }
            }
        }else {
            $conversation = Conversation::where('last_message_id', $message->id)-> first();
            if($conversation){
                $prevMessage = Message::where( function( $query) use($message){
                    $query->where('sender_id', $message->sender_id)
                    ->where('receiver_id', $message->receiver_id)
                    ->orWhere('sender_id', $message->receiver_id)
                    ->where('receiver_id', $message->sender_id);
                })
                ->where('id', '!=', $message->id)
                ->latest()
                ->limit(1)
                ->first();

                if($prevMessage){
                    $conversation->last_message_id = $prevMessage->id;
                    $conversation->save();
                }
            }
        }
        // Add any logic you want to execute before a message is deleted
    }
}
