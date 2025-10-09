<?php

use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('online', function ($user) {
    return $user ? new UserResource($user) : null; // if  user is not authenticated we will recieve null in $user
});



