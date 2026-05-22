<?php

return [
    'paths' => [
        resource_path('views'),
        dirname(base_path()).'/frontend/views',
    ],

    'compiled' => env(
        'VIEW_COMPILED_PATH',
        realpath(storage_path('framework/views'))
    ),
];
